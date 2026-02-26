# Pathway Real-Time Analytics for Parivartan

Real-time streaming analytics layer using Pathway engine integrated with Firebase Firestore.

## Features

- ✅ **Real-time ingestion** from Firestore (5s polling)
- ✅ **Incremental computation** - Only processes changes
- ✅ **Custom connector** - No native Pathway-Firestore connector needed
- ✅ **Thread-safe** - Concurrent access with locks
- ✅ **Deduplication** - Prevents duplicate processing
- ✅ **REST API** - FastAPI endpoints for easy integration
- ✅ **No schema changes** - Read-only Firestore access

## Quick Start

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Add Firebase credentials
cp /path/to/firebase-credentials.json ./

# 3. Run server
python api_server.py
```

Or use the start script:
```bash
chmod +x start.sh
./start.sh
```

## API Endpoints

- `GET /` - Health check
- `GET /analytics/status` - Request count by status
- `GET /analytics/partners` - Partner performance
- `GET /analytics/waste-types` - Waste type breakdown
- `GET /analytics/summary` - Overall summary

## Architecture

```
Firestore (wasteRequests)
    ↓ Poll every 5s
FirestoreConnector (Custom)
    ↓ Emit changes
Pathway Streaming Engine
    ↓ Incremental computation
    ├─ Status stats (groupby status)
    ├─ Partner stats (groupby partnerId)
    └─ Waste type stats (groupby type)
FastAPI REST API
    ↓ JSON responses
Admin Dashboard / Mobile App
```

## Files

- `firestore_connector.py` - Custom Pathway connector for Firestore
- `pathway_analytics.py` - Pathway streaming pipeline
- `api_server.py` - FastAPI REST API
- `requirements.txt` - Python dependencies
- `DEPLOYMENT_GUIDE.md` - Complete deployment instructions

## Incremental Processing

Pathway maintains internal state and only processes new/changed data:

1. **Polling:** Queries Firestore for documents updated since last poll
2. **Deduplication:** Tracks `seen_ids` to skip already processed docs
3. **Emission:** Emits new rows to Pathway
4. **Computation:** Pathway incrementally updates aggregations
5. **API:** Serves latest results via REST endpoints

## Example Usage

```python
# Fetch analytics
import requests

response = requests.get('http://localhost:8000/analytics/summary')
data = response.json()

print(f"Total Requests: {data['summary']['total_requests']}")
print(f"Completion Rate: {data['summary']['completion_rate']}%")
```

## Deployment

See `DEPLOYMENT_GUIDE.md` for:
- WSL setup
- Production deployment
- Systemd service
- Docker container
- Monitoring
- Troubleshooting

## Cost

- **Firestore reads:** ~520K/month = $3-5/month
- **Compute:** 1 CPU, 2GB RAM = $10-20/month
- **Total:** $13-25/month

## Requirements

- Python 3.10+
- Firebase Admin SDK
- Pathway 0.8.0+
- FastAPI
- Firebase service account credentials

## License

Part of Parivartan waste management system.
