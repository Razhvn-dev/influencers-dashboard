import { formatCompactNumber } from '../constants';
import DashboardKpiCard from './dashboard/DashboardKpiCard';

const KPI_ITEMS = [
  { title: 'Total creators', key: 'total', format: 'count' },
  { title: 'Active influencers', key: 'partnered', format: 'count' },
  { title: 'In discussion', key: 'in_discussion', format: 'count' },
  { title: 'Contract signed', key: 'contract_signed', format: 'count' },
  { title: 'Total followers', key: 'total_followers_sum', format: 'followers' },
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
    <div className="crm-dashboard-v2__metrics">
      {KPI_ITEMS.map((item) => (
        <DashboardKpiCard
          key={item.key}
          title={item.title}
          value={formatKpiValue(stats, item)}
          loading={loading}
        />
      ))}
    </div>
  );
}
