import { InlineStack } from '@shopify/polaris';
import PageBackButton from '../PageBackButton';

export default function CreatorHeader({
  backLabel,
  title,
  subtitle,
  onBack,
  actions = null,
}) {
  return (
    <header className="crm-add-creator__header">
      <div className="crm-add-creator__header-top">
        <PageBackButton label={backLabel} onClick={onBack} />
        {actions ? (
          <InlineStack gap="200" blockAlign="center" wrap={false}>
            {actions}
          </InlineStack>
        ) : null}
      </div>
      <div className="crm-add-creator__heading">
        <h1 className="crm-add-creator__title">{title}</h1>
        {subtitle ? <p className="crm-add-creator__subtitle">{subtitle}</p> : null}
      </div>
    </header>
  );
}
