import { BlockStack, Box, Card, Icon, InlineStack, Text } from '@shopify/polaris';

export default function MetricCard({
  label,
  value,
  helpText = '',
  iconSource = null,
  iconBackground = '#EEF2FF',
  iconColor = '#4F46E5',
  tone = 'default',
  loading = false,
}) {
  const displayValue = loading ? '...' : value;
  const valueTone = tone === 'critical' ? 'critical' : undefined;

  return (
    <Box className="crm-v2-metric-card">
      <Card padding="700">
        <InlineStack gap="400" blockAlign="center" wrap={false}>
          {iconSource ? (
            <Box
              className="crm-v2-metric-card__icon"
              style={{ background: iconBackground, color: iconColor }}
            >
              <Icon source={iconSource} />
            </Box>
          ) : null}
          <BlockStack gap="150" className="crm-v2-metric-card__content">
            <Text as="p" className="crm-v2-metric-card__label">
              {label}
            </Text>
            <Text as="p" tone={valueTone} className="crm-v2-metric-card__value">
              {displayValue}
            </Text>
            {helpText ? (
              <Text as="p" className="crm-v2-metric-card__help">
                {helpText}
              </Text>
            ) : null}
          </BlockStack>
        </InlineStack>
      </Card>
    </Box>
  );
}
