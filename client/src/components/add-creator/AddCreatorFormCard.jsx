export default function AddCreatorFormCard({ title, children, className = '' }) {
  return (
    <section className={`crm-add-creator__card ${className}`.trim()}>
      <h2 className="crm-add-creator__card-title">{title}</h2>
      <div className="crm-add-creator__card-body">{children}</div>
    </section>
  );
}
