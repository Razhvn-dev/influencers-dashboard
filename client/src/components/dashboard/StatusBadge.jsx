import { translateStatus, useTranslation } from '../../i18n/LanguageContext.jsx';

export function getStatusBadgeClass(status) {
  const map = {
    Applied: 'crm-status-applied',
    Contacted: 'crm-status-contacted',
    Negotiating: 'crm-status-scheduled',
    'Contract Signed': 'crm-status-approved',
    Approved: 'crm-status-approved',
    'Active Ambassador': 'crm-status-active',
    Partnered: 'crm-status-partnered',
    Rejected: 'crm-status-rejected',
    'Call Scheduled': 'crm-status-scheduled',
    'Under Review': 'crm-status-review',
    'Past Partner': 'crm-status-partnered',
  };

  return map[status] || 'crm-status-default';
}

export default function StatusBadge({ status }) {
  const { t } = useTranslation();

  if (!status) {
    return <span className="crm-table-muted">—</span>;
  }

  return (
    <span className={`crm-status-pill crm-v2-table-status-badge ${getStatusBadgeClass(status)}`}>
      {translateStatus(t, status)}
    </span>
  );
}
