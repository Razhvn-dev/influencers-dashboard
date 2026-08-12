export default function DashboardKpiCard({
  title,
  value,
  hint,
  tone,
  loading = false,
  onClick,
}) {
  const toneClass = tone ? ` crm-kpi-card--${tone}` : '';
  const clickableClass = onClick ? ' crm-kpi-card--clickable' : '';
  const Tag = onClick ? 'button' : 'article';

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      className={`crm-kpi-card${toneClass}${clickableClass}`}
      onClick={onClick}
    >
      <p className="crm-kpi-card__title">{title}</p>
      <p className="crm-kpi-card__value">{loading ? '—' : value}</p>
      {hint ? <p className="crm-kpi-card__hint">{hint}</p> : null}
    </Tag>
  );
}
