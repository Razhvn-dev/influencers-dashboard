import { formatCompactNumber } from '../constants';
import DashboardKpiCard from './dashboard/DashboardKpiCard';

const KPI_GROUPS = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      { title: 'Total creators', key: 'total', format: 'count' },
      { title: 'Active influencers', key: 'partnered', format: 'count' },
      { title: 'In discussion', key: 'in_discussion', format: 'count' },
    ],
  },
  {
    id: 'followups',
    label: 'Follow-ups',
    items: [
      {
        title: 'Overdue follow-ups',
        key: 'followups_overdue',
        format: 'count',
        hint: 'Creators with a next follow-up date in the past',
        tone: 'alert',
      },
      {
        title: 'Due in 7 days',
        key: 'followups_due_7d',
        format: 'count',
        hint: 'Upcoming follow-ups within 7 days (excludes overdue)',
        tone: 'warning',
      },
    ],
  },
];

function formatKpiValue(stats, item) {
  const raw = stats?.[item.key];

  if (item.format === 'followers') {
    return formatCompactNumber(raw);
  }

  return Number(raw || 0).toLocaleString('en-US');
}

export default function StatsCards({ stats, loading }) {
  return (
    <div className="crm-dashboard-v2__metrics-wrap">
      {KPI_GROUPS.map((group) => (
        <section key={group.id} className="crm-dashboard-v2__metrics-group">
          <h2 className="crm-dashboard-v2__metrics-group-label">{group.label}</h2>
          <div className={`crm-dashboard-v2__metrics crm-dashboard-v2__metrics--${group.id}`}>
            {group.items.map((item) => (
              <DashboardKpiCard
                key={item.key}
                title={item.title}
                value={formatKpiValue(stats, item)}
                hint={item.hint}
                tone={item.tone}
                loading={loading}
              />
            ))}
          </div>
        </section>
      ))}
      <p className="crm-dashboard-v2__metrics-note">
        Store-wide totals — not affected by table filters below.
      </p>
    </div>
  );
}
