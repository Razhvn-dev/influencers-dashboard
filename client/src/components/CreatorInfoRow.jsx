import { Text } from '@shopify/polaris';

export default function CreatorInfoRow({
  label,
  value,
  emphasize = false,
  layout = 'inline',
}) {
  const displayValue = value == null || String(value).trim() === '' ? '—' : value;

  if (layout === 'stack') {
    return (
      <div className="crm-info-row crm-info-row--stack">
        <Text as="p" variant="bodySm" tone="subdued">
          {label}
        </Text>
        <Text
          as="p"
          variant={emphasize ? 'headingSm' : 'bodyMd'}
          fontWeight={emphasize ? 'semibold' : 'medium'}
          breakWord
        >
          {displayValue}
        </Text>
      </div>
    );
  }

  return (
    <div className="crm-info-row crm-info-row--inline">
      <Text as="p" variant="bodySm" tone="subdued" className="crm-info-row__label">
        {label}
      </Text>
      <Text
        as="p"
        variant={emphasize ? 'bodyLg' : 'bodyMd'}
        fontWeight={emphasize ? 'semibold' : 'medium'}
        breakWord
        className="crm-info-row__value"
      >
        {displayValue}
      </Text>
    </div>
  );
}
