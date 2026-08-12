import { formatCompactNumber } from '../constants';
import { useTranslation } from '../i18n/LanguageContext.jsx';
import DashboardKpiCard from './dashboard/DashboardKpiCard';

function formatKpiValue(stats, item) {
  const raw = stats?.[item.key];

  if (item.format === 'followers') {
    return formatCompactNumber(raw);
  }

  return Number(raw || 0).toLocaleString('en-US');
}

export default function StatsCards({ stats, loading, onKpiClick }) {
  const { t } = useTranslation();

  const overviewItems = [
    { title: t('kpi.totalCreators'), key: 'total', format: 'count' },
    { title: t('kpi.activeInfluencers'), key: 'partnered', format: 'count' },
    { title: t('kpi.inDiscussion'), key: 'in_discussion', format: 'count' },
  ];

  const followupItems = [
    {
      title: t('kpi.overdueFollowups'),
      key: 'followups_overdue',
      format: 'count',
      hint: t('kpi.overdueHint'),
      tone: 'alert',
      filterKey: 'due_followup',
      filterValue: 'overdue',
    },
    {
      title: t('kpi.dueIn7Days'),
      key: 'followups_due_7d',
      format: 'count',
      hint: t('kpi.dueIn7DaysHint'),
      tone: 'warning',
      filterKey: 'due_followup',
      filterValue: 'due',
    },
  ];

  const renderCard = (item) => (
    <DashboardKpiCard
      key={item.key}
      title={item.title}
      value={formatKpiValue(stats, item)}
      hint={item.hint}
      tone={item.tone}
      loading={loading}
      onClick={
        item.filterKey && onKpiClick
          ? () => onKpiClick(item.filterKey, item.filterValue)
          : undefined
      }
    />
  );

  return (
    <div className="crm-dashboard-v2__metrics-wrap">
      <div className="crm-dashboard-v2__metrics crm-dashboard-v2__metrics--overview">
        {overviewItems.map(renderCard)}
      </div>
      <div className="crm-dashboard-v2__metrics crm-dashboard-v2__metrics--followups">
        {followupItems.map(renderCard)}
      </div>
    </div>
  );
}
