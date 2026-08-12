import { formatLastContactLabel } from '../../constants';
import { useTranslation } from '../../i18n/LanguageContext.jsx';

function getActivityItems(record, t) {
  return [
    { id: 'verified', label: t('creatorList.lastVerified'), timestamp: record.followers_last_verified_at },
    { id: 'contact', label: t('creatorList.lastContact'), timestamp: record.last_contacted_at },
  ];
}

function getMostRecentActivity(items) {
  const dated = items.filter((item) => item.timestamp);
  if (dated.length === 0) {
    return null;
  }

  return dated.sort(
    (left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime()
  )[0];
}

export default function CreatorActivityCell({ record }) {
  const { t } = useTranslation();
  const items = getActivityItems(record, t);
  const primary = getMostRecentActivity(items);

  if (!primary) {
    return <span className="crm-resource-activity__value crm-resource-activity__value--empty">—</span>;
  }

  const activitySummary = items
    .map((item) => `${item.label}: ${item.timestamp ? formatLastContactLabel(item.timestamp) : '—'}`)
    .join(' · ');

  return (
    <div
      className="crm-resource-activity crm-resource-activity--compact crm-resource-activity--date-only"
      title={activitySummary}
      aria-label={activitySummary}
    >
      <span className="crm-resource-activity__value">
        {formatLastContactLabel(primary.timestamp)}
      </span>
    </div>
  );
}
