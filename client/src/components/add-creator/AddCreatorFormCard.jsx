export default function AddCreatorFormCard({
  title,
  children,
  className = '',
  action = null,
  badge = null,
}) {
  return (
    <section className={`crm-add-creator__card ${className}`.trim()}>
      <div className="crm-add-creator__card-header">
        <h2 className="crm-add-creator__card-title">{title}</h2>
        {badge ? <span className="crm-add-creator__card-badge">{badge}</span> : null}
        {action ? <div className="crm-add-creator__card-action">{action}</div> : null}
      </div>
      <div className="crm-add-creator__card-body">{children}</div>
    </section>
  );
}
