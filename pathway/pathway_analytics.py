import pathway as pw
self.requests_table = create_firestore_table(...)
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class PathwayAnalytics:
    """Real-time analytics using Pathway streaming engine."""
    
    def __init__(self, credential_path: str = None):
        self.credential_path = credential_path
        self.requests_table = None
        self.status_stats = None
        self.partner_stats = None
        self.waste_type_stats = None
        
    def setup_pipeline(self):
        """Setup Pathway streaming pipeline."""
        logger.info("Setting up Pathway pipeline...")
        
        # Ingest wasteRequests from Firestore
        self.requests_table = create_firestore_table(
            collection_name='wasteRequests',
            poll_interval=5,
            credential_path=self.credential_path
        )
        
        # Analytics 1: Count by status
        self.status_stats = (
            self.requests_table
            .groupby(self.requests_table.status)
            .reduce(
                status=pw.this.status,
                count=pw.reducers.count(),
                total_quantity=pw.reducers.sum(pw.this.quantity)
            )
        )
        
        # Analytics 2: Partner performance
        self.partner_stats = (
            self.requests_table
            .groupby(self.requests_table.partnerId)
            .reduce(
                partnerId=pw.this.partnerId,
                total_requests=pw.reducers.count(),
                total_waste=pw.reducers.sum(pw.this.quantity),
                completed_count=pw.reducers.sum(
                    pw.if_else(pw.this.status == 'Completed', 1, 0)
                )
            )
        )
        
        # Analytics 3: Waste type breakdown
        self.waste_type_stats = (
            self.requests_table
            .groupby(self.requests_table.type)
            .reduce(
                waste_type=pw.this.type,
                count=pw.reducers.count(),
                total_quantity=pw.reducers.sum(pw.this.quantity)
            )
        )
        
        logger.info("Pipeline setup complete")
    
    def get_status_stats(self):
        """Get current status statistics."""
        return self.status_stats
    
    def get_partner_stats(self):
        """Get partner performance statistics."""
        return self.partner_stats
    
    def get_waste_type_stats(self):
        """Get waste type statistics."""
        return self.waste_type_stats
    
    def run(self):
        """Run Pathway computation."""
        logger.info("Starting Pathway computation...")
        pw.run()


if __name__ == "__main__":
    # Initialize analytics
    analytics = PathwayAnalytics(credential_path='./firebase-credentials.json')
    analytics.setup_pipeline()
    
    # Run streaming computation
    analytics.run()
