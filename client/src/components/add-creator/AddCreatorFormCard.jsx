export default function AddCreatorFormCard({
  title,
  children,
  className = '',
  action = null,
  badge = null,
  description = null,
  sectionId = undefined,
}) {
  return (
    <section id={sectionId} className={`crm-add-creator__card ${className}`.trim()}>
      <div className="crm-add-creator__card-header">
        <div className="crm-add-creator__card-heading-copy">
          <h2 className="crm-add-creator__card-title">{title}</h2>
          {description ? <p className="crm-add-creator__card-description">{description}</p> : null}
        </div>
        {badge ? <span className="crm-add-creator__card-badge">{badge}</span> : null}
        {action ? <div className="crm-add-creator__card-action">{action}</div> : null}
      </div>
      <div className="crm-add-creator__card-body">{children}</div>
    </section>
  );
}
