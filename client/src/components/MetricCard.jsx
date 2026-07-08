import { BlockStack, Box, Card, Icon, InlineStack, Text } from '@shopify/polaris';

export default function MetricCard({
  label,
  value,
  helpText,
  tone = 'default',
  iconSource = null,
  iconBackground = '#F3F4F6',
  iconColor = '#4B5563',
  loading = false,
}) {
  const displayValue = loading ? '—' : value;
  const valueTone = tone === 'critical' ? 'critical' : undefined;

  return (
    <Box className="crm-metric-card">
      <Card padding="500">
        <BlockStack gap="400">
          <InlineStack gap="200" blockAlign="center" wrap={false}>
            {iconSource ? (
              <Box
                className="crm-metric-card__icon"
                style={{
                  background: iconBackground,
                  color: iconColor,
                }}
              >
                <Icon source={iconSource} tone="base" />
              </Box>
            ) : null}
            <Text as="p" variant="bodySm" tone="subdued">
              {label}
            </Text>
          </InlineStack>

          <Text
            as="p"
            variant="heading2xl"
            tone={valueTone}
            fontWeight="bold"
            className="crm-metric-card__value"
          >
            {displayValue}
          </Text>

          {helpText ? (
            <Text as="p" variant="bodySm" tone="subdued">
              {helpText}
            </Text>
          ) : null}
        </BlockStack>
      </Card>
    </Box>
  );
}
