# Pathway Analytics Deployment Guide

## Overview

Real-time analytics layer using Pathway streaming engine integrated with Firebase Firestore.

**Architecture:**
```
Firestore (wasteRequests) 
    ↓ (polling every 5s)
Custom Python Connector
    ↓ (emit changes)
Pathway Streaming Engine
    ↓ (incremental computation)
FastAPI REST API
    ↓ (expose analytics)
Admin Dashboard / Mobile App
```

---

## Prerequisites

### 1. WSL Setup (Windows)

```bash
# Install WSL2
wsl --install

# Update WSL
wsl --update

# Install Ubuntu
wsl --install -d Ubuntu-22.04
```

### 2. Python 3.10+

```bash
# In WSL
sudo apt update
sudo apt install python3.10 python3-pip python3-venv
```

### 3. Firebase Service Account

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save as `firebase-credentials.json`
4. Copy to `pathway/` directory

---

## Installation

### Step 1: Navigate to Pathway Directory

```bash
cd /mnt/c/Programming/PROJECT/Parivartan/pathway
```

### Step 2: Create Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Place Firebase Credentials

```bash
# Copy firebase-credentials.json to pathway directory
cp /path/to/firebase-credentials.json ./firebase-credentials.json
```

---

## Running the Service

### Option 1: Development Mode

```bash
# Activate virtual environment
source venv/bin/activate

# Run API server
python api_server.py
```

Server starts at: `http://localhost:8000`

### Option 2: Production Mode

```bash
# Using uvicorn directly
uvicorn api_server:app --host 0.0.0.0 --port 8000 --workers 1
```

### Option 3: Background Service

```bash
# Using nohup
nohup python api_server.py > pathway.log 2>&1 &

# Check process
ps aux | grep api_server

# View logs
tail -f pathway.log
```

---

## API Endpoints

### Health Check
```bash
curl http://localhost:8000/
```

### Status Analytics
```bash
curl http://localhost:8000/analytics/status
```

Response:
```json
{
  "data": [
    {
      "status": "Completed",
      "count": 150,
      "total_quantity": 450.5
    },
    {
      "status": "In Progress",
      "count": 25,
      "total_quantity": 75.0
    }
  ]
}
```

### Partner Analytics
```bash
curl http://localhost:8000/analytics/partners
```

Response:
```json
{
  "data": [
    {
      "partnerId": "partner123",
      "total_requests": 50,
      "total_waste": 150.5,
      "completed_count": 45,
      "completion_rate": 90.0
    }
  ]
}
```

### Waste Type Analytics
```bash
curl http://localhost:8000/analytics/waste-types
```

### Summary
```bash
curl http://localhost:8000/analytics/summary
```

---

## How It Works

### 1. Firestore Polling

**FirestoreConnector** polls Firestore every 5 seconds:

```python
query = (
    db.collection('wasteRequests')
    .where('updatedAt', '>=', last_poll_time)
    .order_by('updatedAt')
)
```

**Deduplication:**
- Tracks `seen_ids` set
- Skips already processed documents
- Thread-safe with locks

### 2. Pathway Ingestion

Documents converted to Pathway rows:

```python
{
    'id': doc_id,
    'userId': data['userId'],
    'partnerId': data['partnerId'],
    'type': data['type'],
    'quantity': data['quantity'],
    'status': data['status'],
    'timestamp': timestamp_ms
}
```

### 3. Incremental Computation

**Status Stats:**
```python
status_stats = (
    requests_table
    .groupby(requests_table.status)
    .reduce(
        status=pw.this.status,
        count=pw.reducers.count(),
        total_quantity=pw.reducers.sum(pw.this.quantity)
    )
)
```

**Partner Stats:**
```python
partner_stats = (
    requests_table
    .groupby(requests_table.partnerId)
    .reduce(
        partnerId=pw.this.partnerId,
        total_requests=pw.reducers.count(),
        total_waste=pw.reducers.sum(pw.this.quantity),
        completed_count=pw.reducers.sum(
            pw.if_else(pw.this.status == 'Completed', 1, 0)
        )
    )
)
```

**Incremental Updates:**
- Pathway maintains internal state
- Only processes new/changed data
- Efficient for streaming workloads

### 4. API Exposure

FastAPI serves results:
- Converts Pathway tables to JSON
- Thread-safe access with locks
- Real-time data (updated every 5s)

---

## Testing

### Test 1: Verify Firestore Connection

```bash
# Check logs
tail -f pathway.log

# Should see:
# INFO:firestore_connector:Firestore connector initialized
# INFO:firestore_connector:Starting Firestore polling...
# INFO:firestore_connector:Emitted X new/updated documents
```

### Test 2: Test API Endpoints

```bash
# Status analytics
curl http://localhost:8000/analytics/status | jq

# Partner analytics
curl http://localhost:8000/analytics/partners | jq

# Summary
curl http://localhost:8000/analytics/summary | jq
```

### Test 3: Verify Real-Time Updates

1. Update a request status in Firestore Console
2. Wait 5-10 seconds
3. Call API endpoint
4. Verify count updated

---

## Monitoring

### Check Service Status

```bash
# Check if running
ps aux | grep api_server

# Check port
netstat -tulpn | grep 8000
```

### View Logs

```bash
# Real-time logs
tail -f pathway.log

# Search for errors
grep ERROR pathway.log

# Count processed documents
grep "Emitted" pathway.log | wc -l
```

### Performance Metrics

```bash
# Memory usage
ps aux | grep api_server | awk '{print $4}'

# CPU usage
top -p $(pgrep -f api_server)
```

---

## Troubleshooting

### Issue 1: Firebase Connection Error

**Error:** `DefaultCredentialsError`

**Solution:**
```bash
# Verify credentials file exists
ls -la firebase-credentials.json

# Check file permissions
chmod 600 firebase-credentials.json

# Set environment variable
export GOOGLE_APPLICATION_CREDENTIALS="./firebase-credentials.json"
```

### Issue 2: Pathway Import Error

**Error:** `ModuleNotFoundError: No module named 'pathway'`

**Solution:**
```bash
# Activate venv
source venv/bin/activate

# Reinstall
pip install pathway==0.8.0
```

### Issue 3: Port Already in Use

**Error:** `Address already in use`

**Solution:**
```bash
# Find process
lsof -i :8000

# Kill process
kill -9 <PID>

# Or use different port
uvicorn api_server:app --port 8001
```

### Issue 4: No Data in Analytics

**Possible causes:**
1. No documents in Firestore
2. Missing `updatedAt` field
3. Polling interval too long

**Solution:**
```bash
# Check Firestore has data
# Verify updatedAt field exists
# Reduce poll_interval to 2 seconds
```

---

## Production Deployment

### Using systemd (Linux)

Create service file: `/etc/systemd/system/pathway-analytics.service`

```ini
[Unit]
Description=Pathway Analytics Service
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/Parivartan/pathway
Environment="PATH=/home/ubuntu/Parivartan/pathway/venv/bin"
ExecStart=/home/ubuntu/Parivartan/pathway/venv/bin/python api_server.py
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable pathway-analytics
sudo systemctl start pathway-analytics
sudo systemctl status pathway-analytics
```

### Using Docker

```dockerfile
FROM python:3.10-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["python", "api_server.py"]
```

Build and run:
```bash
docker build -t pathway-analytics .
docker run -d -p 8000:8000 -v $(pwd)/firebase-credentials.json:/app/firebase-credentials.json pathway-analytics
```

---

## Scalability Considerations

### Current Setup
- Single-threaded Pathway computation
- Polling every 5 seconds
- In-memory state

### For High Volume

**1. Reduce Polling Interval:**
```python
poll_interval=2  # 2 seconds instead of 5
```

**2. Batch Processing:**
```python
# Process in batches of 100
query.limit(100)
```

**3. Distributed Pathway:**
```python
# Use Pathway's distributed mode
pw.run(monitoring_level=pw.MonitoringLevel.ALL)
```

**4. Caching:**
```python
# Cache API responses for 5 seconds
from fastapi_cache import FastAPICache
```

---

## Cost Estimate

**Firestore Reads:**
- Polling every 5s = 720 queries/hour
- 17,280 queries/day
- ~520,000 queries/month

**Free tier:** 50,000 reads/day
**Estimated cost:** $3-5/month

**Compute:**
- Single VM/container
- 1 CPU, 2GB RAM
- $10-20/month

**Total: $13-25/month**

---

## Integration with Admin Dashboard

### React/Next.js Example

```typescript
import { useEffect, useState } from 'react';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  
  useEffect(() => {
    const fetchAnalytics = async () => {
      const response = await fetch('http://localhost:8000/analytics/summary');
      const data = await response.json();
      setAnalytics(data.summary);
    };
    
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 10000); // Update every 10s
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div>
      <h1>Real-Time Analytics</h1>
      {analytics && (
        <div>
          <p>Total Requests: {analytics.total_requests}</p>
          <p>Completed: {analytics.completed_requests}</p>
          <p>Completion Rate: {analytics.completion_rate}%</p>
          <p>Total Waste: {analytics.total_waste_kg} kg</p>
        </div>
      )}
    </div>
  );
};
```

---

## Summary

✅ **Custom Firestore Connector** - Polls every 5s
✅ **Deduplication** - Tracks seen documents
✅ **Incremental Computation** - Pathway streaming
✅ **Thread-Safe** - Locks for concurrent access
✅ **REST API** - FastAPI endpoints
✅ **WSL Compatible** - Tested on Ubuntu
✅ **No Schema Changes** - Read-only Firestore access
✅ **No Mobile App Changes** - Backend only

**Ready for production deployment!**
