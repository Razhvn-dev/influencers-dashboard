import { BlockStack, Box, Card, Text } from '@shopify/polaris';

export default function MetricCard({
  label,
  value,
  tone = 'default',
  loading = false,
}) {
  const displayValue = loading ? '—' : value;
  const valueTone = tone === 'critical' ? 'critical' : undefined;

  return (
    <Box className="crm-v2-metric-card">
      <Card padding="700">
        <BlockStack gap="400" className="crm-v2-metric-card__content">
          <Text as="p" className="crm-v2-metric-card__label">
            {label}
          </Text>
          <Text as="p" tone={valueTone} className="crm-v2-metric-card__value">
            {displayValue}
          </Text>
        </BlockStack>
      </Card>
    </Box>
  );
}
