from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pathway as pw
from pathway_analytics import PathwayAnalytics
import threading
import logging
from typing import Dict, List

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Parivartan Pathway Analytics API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global analytics instance
analytics = None
analytics_lock = threading.Lock()


def start_pathway_computation():
    """Start Pathway computation in background thread."""
    global analytics
    
    logger.info("Initializing Pathway analytics...")
    analytics = PathwayAnalytics(credential_path='./firebase-credentials.json')
    analytics.setup_pipeline()
    
    logger.info("Starting Pathway computation thread...")
    analytics.run()


@app.on_event("startup")
async def startup_event():
    """Start Pathway computation on server startup."""
    computation_thread = threading.Thread(target=start_pathway_computation, daemon=True)
    computation_thread.start()
    logger.info("Pathway computation started in background")


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "running",
        "service": "Parivartan Pathway Analytics",
        "version": "1.0.0"
    }


@app.get("/analytics/status")
async def get_status_analytics():
    """Get request count by status."""
    if analytics is None or analytics.status_stats is None:
        raise HTTPException(status_code=503, detail="Analytics not ready")
    
    try:
        with analytics_lock:
            # Convert Pathway table to list of dicts
            results = []
            snapshot = pw.debug.table_to_dicts(analytics.status_stats)
            
            for row in snapshot.values():
                results.append({
                    'status': row['status'],
                    'count': row['count'],
                    'total_quantity': row['total_quantity']
                })
            
            return {
                "data": results,
                "timestamp": pw.debug.compute_and_print(analytics.status_stats)
            }
    except Exception as e:
        logger.error(f"Error fetching status analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/analytics/partners")
async def get_partner_analytics():
    """Get partner performance statistics."""
    if analytics is None or analytics.partner_stats is None:
        raise HTTPException(status_code=503, detail="Analytics not ready")
    
    try:
        with analytics_lock:
            results = []
            snapshot = pw.debug.table_to_dicts(analytics.partner_stats)
            
            for row in snapshot.values():
                completion_rate = 0
                if row['total_requests'] > 0:
                    completion_rate = (row['completed_count'] / row['total_requests']) * 100
                
                results.append({
                    'partnerId': row['partnerId'],
                    'total_requests': row['total_requests'],
                    'total_waste': row['total_waste'],
                    'completed_count': row['completed_count'],
                    'completion_rate': round(completion_rate, 2)
                })
            
            return {"data": results}
    except Exception as e:
        logger.error(f"Error fetching partner analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/analytics/waste-types")
async def get_waste_type_analytics():
    """Get waste type breakdown."""
    if analytics is None or analytics.waste_type_stats is None:
        raise HTTPException(status_code=503, detail="Analytics not ready")
    
    try:
        with analytics_lock:
            results = []
            snapshot = pw.debug.table_to_dicts(analytics.waste_type_stats)
            
            for row in snapshot.values():
                results.append({
                    'waste_type': row['waste_type'],
                    'count': row['count'],
                    'total_quantity': row['total_quantity']
                })
            
            # Sort by quantity descending
            results.sort(key=lambda x: x['total_quantity'], reverse=True)
            
            return {"data": results}
    except Exception as e:
        logger.error(f"Error fetching waste type analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/analytics/summary")
async def get_analytics_summary():
    """Get overall analytics summary."""
    if analytics is None:
        raise HTTPException(status_code=503, detail="Analytics not ready")
    
    try:
        with analytics_lock:
            # Get all analytics
            status_snapshot = pw.debug.table_to_dicts(analytics.status_stats)
            partner_snapshot = pw.debug.table_to_dicts(analytics.partner_stats)
            waste_snapshot = pw.debug.table_to_dicts(analytics.waste_type_stats)
            
            # Calculate totals
            total_requests = sum(row['count'] for row in status_snapshot.values())
            total_waste = sum(row['total_quantity'] for row in status_snapshot.values())
            total_partners = len(partner_snapshot)
            total_waste_types = len(waste_snapshot)
            
            # Get completed count
            completed_count = 0
            for row in status_snapshot.values():
                if row['status'] == 'Completed':
                    completed_count = row['count']
            
            completion_rate = 0
            if total_requests > 0:
                completion_rate = (completed_count / total_requests) * 100
            
            return {
                "summary": {
                    "total_requests": total_requests,
                    "completed_requests": completed_count,
                    "completion_rate": round(completion_rate, 2),
                    "total_waste_kg": round(total_waste, 2),
                    "active_partners": total_partners,
                    "waste_types": total_waste_types
                }
            }
    except Exception as e:
        logger.error(f"Error fetching summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
