# Standardized Pathway Streaming Architecture

## Overview

Clean, modular streaming implementation with singleton pattern and thread-safe snapshots.

---

## Architecture

```
┌─────────────────────────────────────────┐
│         FastAPI Server (Main)           │
│  - Starts on server startup             │
│  - Calls engine.start() once            │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│    StreamingEngine (Singleton)          │
│  - Single instance across app           │
│  - Runs pw.run() in daemon thread       │
│  - Never restarts pipeline              │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│      Pathway Computation Thread         │
│  - Background daemon thread             │
│  - Runs continuously                    │
│  - Incremental updates                  │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│       SnapshotLayer (Thread-Safe)       │
│  - RLock for concurrent access          │
│  - Stores latest table snapshots        │
│  - Updated via pw.io.subscribe          │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│         FastAPI Endpoints               │
│  - Read from snapshot layer             │
│  - No pw.run() calls                    │
│  - Instant response                     │
└─────────────────────────────────────────┘
```

---

## Key Components

### 1. StreamingEngine (Singleton)

**Purpose:** Single instance managing Pathway computation

**Features:**
- Thread-safe singleton pattern
- One-time pipeline setup
- Background daemon thread
- No duplicate pw.run()

**Usage:**
```python
engine = get_engine()  # Always returns same instance
engine.start()         # Starts computation once
```

### 2. SnapshotLayer (Thread-Safe)

**Purpose:** Store latest analytics snapshots

**Features:**
- RLock for concurrent reads/writes
- Key-value storage
- Atomic updates

**Usage:**
```python
snapshot_layer.update('status_stats', data)
data = snapshot_layer.get('status_stats')
```

### 3. Incremental Computation

**How it works:**
- Pathway maintains internal state
- Only processes new/changed data
- Aggregations update incrementally
- No full recomputation

**Example:**
```python
status_stats = (
    requests_table
    .groupby(requests_table.status)
    .reduce(count=pw.reducers.count())
)
# Updates incrementally as new data arrives
```

### 4. Output Callbacks

**Purpose:** Update snapshots on data changes

**Implementation:**
```python
pw.io.subscribe(
    status_stats,
    on_change=lambda key, row, time, is_addition:
        snapshot_layer.update('status_stats', status_stats)
)
```

---

## API Endpoints

### GET /
Health check

### GET /analytics/status
Status statistics (Assigned, Completed, etc.)

### GET /analytics/partners
Partner performance metrics

### GET /analytics/locations
Location distribution

### GET /analytics/waste-types
Waste type breakdown

### GET /analytics/summary
Overall summary

### GET /analytics/all
All analytics in one call

---

## Best Practices

### 1. Single pw.run() Execution

**DO:**
```python
# In startup event
engine = get_engine()
engine.start()  # Calls pw.run() once
```

**DON'T:**
```python
# In API endpoint
pw.run()  # Never call in endpoints!
```

### 2. Thread Safety

**DO:**
```python
with self._lock:
    return self._snapshots.copy()
```

**DON'T:**
```python
return self._snapshots  # Not thread-safe!
```

### 3. Singleton Pattern

**DO:**
```python
_instance = None
def __new__(cls):
    if cls._instance is None:
        cls._instance = super().__new__(cls)
    return cls._instance
```

### 4. Daemon Threads

**DO:**
```python
thread = threading.Thread(
    target=run_computation,
    daemon=True  # Dies with main process
)
```

---

## Scalability

### Current Setup
- Single-threaded Pathway computation
- In-memory snapshots
- Demo stream (1000 rows)

### For Production

**1. Increase Stream Size:**
```python
pw.demo.range_stream(nb_rows=100000)
```

**2. Add Caching:**
```python
from functools import lru_cache

@lru_cache(maxsize=128)
def get_cached_stats():
    return engine.get_status_stats()
```

**3. Batch Updates:**
```python
# Update snapshots every N changes
if change_count % 10 == 0:
    snapshot_layer.update(key, data)
```

**4. Distributed Pathway:**
```python
# For very high volume
pw.run(monitoring_level=pw.MonitoringLevel.ALL)
```

---

## Integration Examples

### React Dashboard

```typescript
const fetchAnalytics = async () => {
  const response = await fetch('http://localhost:8000/analytics/all');
  const data = await response.json();
  
  setSummary(data.summary);
  setStatusData(data.status);
  setPartnerData(data.partners);
};

useEffect(() => {
  fetchAnalytics();
  const interval = setInterval(fetchAnalytics, 5000);
  return () => clearInterval(interval);
}, []);
```

### Admin Dashboard

```typescript
const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  
  useEffect(() => {
    fetch('http://localhost:8000/analytics/summary')
      .then(res => res.json())
      .then(data => setAnalytics(data.summary));
  }, []);
  
  return (
    <div>
      <h1>Total Requests: {analytics?.total_requests}</h1>
      <h2>Completion Rate: {analytics?.completion_rate}%</h2>
    </div>
  );
};
```

---

## Running the Service

```bash
# Start server
python api_server.py

# Or with uvicorn
uvicorn api_server:app --host 0.0.0.0 --port 8000
```

Server starts at: http://localhost:8000

---

## Testing

```bash
# Health check
curl http://localhost:8000/

# Status analytics
curl http://localhost:8000/analytics/status

# All analytics
curl http://localhost:8000/analytics/all | jq
```

---

## Summary

✅ **Singleton pattern** - One engine instance
✅ **Background thread** - Daemon thread for pw.run()
✅ **Thread-safe snapshots** - RLock protection
✅ **No duplicate execution** - pw.run() called once
✅ **Incremental computation** - Pathway handles updates
✅ **Clean API** - Separate endpoints per analytics
✅ **Scalable** - Ready for production
