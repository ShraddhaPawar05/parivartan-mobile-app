// Utility function to normalize status values from Firestore
export const normalizeStatus = (status: string | undefined): string => {
  if (!status) return 'Assigned';
  
  const statusMap: { [key: string]: string } = {
    'pending': 'Assigned',
    'assigned': 'Assigned',
    'accepted': 'Accepted',
    'in progress': 'In Progress',
    'in_progress': 'In Progress',
    'completed': 'Completed'
  };
  
  const lowerStatus = status.toLowerCase();
  return statusMap[lowerStatus] || status;
};
