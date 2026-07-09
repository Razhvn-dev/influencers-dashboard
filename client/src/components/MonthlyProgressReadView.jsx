import { Badge } from '@shopify/polaris';
import { MONTHLY_PERIOD_LABELS, openExternalUrl } from '../constants';

function hasValue(value) {
  return String(value || '').trim().length > 0;
}

function statusForPeriod(period) {
  const checkIn = hasValue(period.monthly_check_in);
  const content = hasValue(period.content_delivered);
  const link = hasValue(period.link);

  if (checkIn && content && link) return { label: 'Completed', tone: 'success' };
  if (checkIn || content || link) return { label: 'In progress', tone: 'info' };
  return { label: 'Not started', tone: 'attention' };
}

function dotClass(value) {
  if (!hasValue(value)) return 'crm-detail-progress-dot--empty';
  const normalized = String(value).trim().toUpperCase();
  if (normalized === 'NO' || normalized === 'PENDING') return 'crm-detail-progress-dot--pending';
  return 'crm-detail-progress-dot--done';
}

export default function MonthlyProgressReadView({ periods }) {
  return (
    <div className="crm-detail-progress-table-wrap">
      <table className="crm-detail-progress-table">
        <thead>
          <tr>
            <th>Period</th>
            <th>Check-in</th>
            <th>Content Delivered</th>
            <th>Link</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {periods.map((period) => {
            const checkIn = String(period.monthly_check_in || '').trim();
            const content = String(period.content_delivered || '').trim();
            const link = String(period.link || '').trim();
            const status = statusForPeriod(period);

            return (
              <tr key={period.period_index}>
                <td>{MONTHLY_PERIOD_LABELS[period.period_index - 1] || `Period ${period.period_index}`}</td>
                <td>
                  <span className="crm-detail-progress-cell">
                    <span className={`crm-detail-progress-dot ${dotClass(checkIn)}`} />
                    {checkIn || 'Not started'}
                  </span>
                </td>
                <td>
                  <span className="crm-detail-progress-cell">
                    <span className={`crm-detail-progress-dot ${dotClass(content)}`} />
                    {content || 'Not started'}
                  </span>
                </td>
                <td>
                  {link ? (
                    <button
                      type="button"
                      className="crm-open-link"
                      onClick={() => openExternalUrl(link)}
                    >
                      Open
                    </button>
                  ) : (
                    'Not set'
                  )}
                </td>
                <td>
                  <Badge tone={status.tone}>{status.label}</Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="crm-detail-progress-footnote">
        Fixed 5 contract periods. Click Edit to update check-ins, content, and links.
      </p>
    </div>
  );
}
