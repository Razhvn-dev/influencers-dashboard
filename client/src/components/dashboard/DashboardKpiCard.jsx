export default function DashboardKpiCard({ title, value, loading = false }) {
  return (
    <article className="crm-kpi-card">
      <p className="crm-kpi-card__title">{title}</p>
      <p className="crm-kpi-card__value">{loading ? '—' : value}</p>
    </article>
  );
}
