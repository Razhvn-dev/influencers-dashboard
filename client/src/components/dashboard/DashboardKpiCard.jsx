export default function DashboardKpiCard({ title, value, hint, tone, loading = false }) {
  const toneClass = tone ? ` crm-kpi-card--${tone}` : '';

  return (
    <article className={`crm-kpi-card${toneClass}`}>
      <p className="crm-kpi-card__title">{title}</p>
      <p className="crm-kpi-card__value">{loading ? '—' : value}</p>
      {hint ? <p className="crm-kpi-card__hint">{hint}</p> : null}
    </article>
  );
}
