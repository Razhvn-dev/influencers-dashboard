export function getStatusBadgeClass(status) {
  const map = {
    Applied: 'crm-status-applied',
    Contacted: 'crm-status-contacted',
    Negotiating: 'crm-status-negotiating',
    'Contract Signed': 'crm-status-contract',
    Approved: 'crm-status-contract',
    'Active Ambassador': 'crm-status-contract',
    Partnered: 'crm-status-contract',
    Rejected: 'crm-status-rejected',
    'Call Scheduled': 'crm-status-negotiating',
    'Under Review': 'crm-status-negotiating',
    'Past Partner': 'crm-status-default',
  };

  return map[status] || 'crm-status-default';
}

export default function StatusBadge({ status }) {
  if (!status) {
    return <span className="crm-table-muted">—</span>;
  }

  return (
    <span className={`crm-status-pill crm-v2-table-status-badge ${getStatusBadgeClass(status)}`}>
      {status}
    </span>
  );
}
