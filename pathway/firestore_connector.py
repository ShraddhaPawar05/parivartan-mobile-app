import pathway as pw
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timedelta
import time
import threading
from typing import Any, Dict, List
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class FirestoreConnector(pw.io.python.ConnectorSubject):
    """Custom Pathway connector for Firebase Firestore polling."""
    
    def __init__(
        self,
        collection_name: str,
        poll_interval: int = 5,
        credential_path: str = None
    ):
        super().__init__()
        self.collection_name = collection_name
        self.poll_interval = poll_interval
        self.last_poll_time = datetime.utcnow() - timedelta(days=1)
        self.seen_ids = set()
        self._lock = threading.Lock()
        
        # Initialize Firebase Admin
        if not firebase_admin._apps:
            if credential_path:
                cred = credentials.Certificate(credential_path)
            else:
                cred = credentials.ApplicationDefault()
            firebase_admin.initialize_app(cred)
        
        self.db = firestore.client()
        logger.info(f"Firestore connector initialized for collection: {collection_name}")
    
    def run(self):
        """Continuously poll Firestore and emit changes."""
        logger.info("Starting Firestore polling...")
        
        while True:
            try:
                self._poll_and_emit()
                time.sleep(self.poll_interval)
            except Exception as e:
                logger.error(f"Error in polling loop: {e}")
                time.sleep(self.poll_interval)
    
    def _poll_and_emit(self):
        """Poll Firestore for new/updated documents."""
        current_time = datetime.utcnow()
        
        query = (
            self.db.collection(self.collection_name)
            .where('updatedAt', '>=', self.last_poll_time)
            .order_by('updatedAt')
        )
        
        docs = query.stream()
        new_count = 0
        
        with self._lock:
            for doc in docs:
                doc_id = doc.id
                data = doc.to_dict()
                
                if doc_id in self.seen_ids:
                    continue
                
                row = self._prepare_row(doc_id, data)
                self.next(**row)
                self.seen_ids.add(doc_id)
                new_count += 1
            
            self.last_poll_time = current_time
        
        if new_count > 0:
            logger.info(f"Emitted {new_count} new/updated documents")
    
    def _prepare_row(self, doc_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Convert Firestore document to Pathway row."""
        updated_at = data.get('updatedAt')
        if hasattr(updated_at, 'timestamp'):
            timestamp = int(updated_at.timestamp() * 1000)
        else:
            timestamp = int(time.time() * 1000)
        
        return {
            'id': doc_id,
            'userId': data.get('userId', ''),
            'partnerId': data.get('partnerId', ''),
            'type': data.get('type', ''),
            'quantity': float(data.get('quantity', 0)),
            'status': data.get('status', ''),
            'timestamp': timestamp
        }


def create_firestore_table(
    collection_name: str,
    poll_interval: int = 5,
    credential_path: str = None
) -> pw.Table:
    """Create Pathway table from Firestore collection."""
    
    class FirestoreSchema(pw.Schema):
        id: str
        userId: str
        partnerId: str
        type: str
        quantity: float
        status: str
        timestamp: int
    
    connector = FirestoreConnector(
        collection_name=collection_name,
        poll_interval=poll_interval,
        credential_path=credential_path
    )
    
    table = pw.io.python.read(
        connector,
        schema=FirestoreSchema,
        autocommit_duration_ms=1000
    )
    
    return table
