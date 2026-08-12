export default function CreatorCreateLayout({ children, sidebar }) {
  return (
    <div className="crm-add-creator__layout">
      <main className="crm-add-creator__content" aria-label="Creator details form">
        <div className="crm-add-creator__form-stack">{children}</div>
      </main>
      <aside className="crm-add-creator__preview-column" aria-label="Creator live preview">
        {sidebar}
      </aside>
    </div>
  );
}
