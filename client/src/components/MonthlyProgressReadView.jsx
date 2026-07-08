import { Badge, BlockStack, Box, InlineGrid, Text } from '@shopify/polaris';
import { MONTHLY_PERIOD_LABELS, openExternalUrl } from '../constants';

function checkInTone(value) {
  const normalized = String(value || '').trim().toUpperCase();
  if (normalized === 'YES') return 'success';
  if (normalized === 'NO') return 'critical';
  return undefined;
}

export default function MonthlyProgressReadView({ periods }) {
  return (
    <BlockStack gap="0" className="crm-progress-table">
      <Box padding="500" paddingBlockEnd="400" className="crm-progress-table__head">
        <InlineGrid columns={{ xs: 2, sm: 4 }} gap="400">
          <Text as="span" variant="bodySm" tone="subdued" fontWeight="semibold">
            Period
          </Text>
          <Text as="span" variant="bodySm" tone="subdued" fontWeight="semibold">
            Check-in
          </Text>
          <Text as="span" variant="bodySm" tone="subdued" fontWeight="semibold">
            Content
          </Text>
          <Text as="span" variant="bodySm" tone="subdued" fontWeight="semibold">
            Link
          </Text>
        </InlineGrid>
      </Box>

      {periods.map((period) => {
        const checkIn = String(period.monthly_check_in || '').trim();
        const content = String(period.content_delivered || '').trim();
        const link = String(period.link || '').trim();

        return (
          <Box key={period.period_index} padding="500" className="crm-progress-read-row">
            <InlineGrid columns={{ xs: 2, sm: 4 }} gap="400" alignItems="center">
              <Text as="span" variant="bodyMd" fontWeight="medium">
                {MONTHLY_PERIOD_LABELS[period.period_index - 1] || `Period ${period.period_index}`}
              </Text>
              <Box>
                {checkIn ? (
                  <Badge tone={checkInTone(checkIn)}>{checkIn}</Badge>
                ) : (
                  <Text as="span" tone="subdued" variant="bodySm">
                    —
                  </Text>
                )}
              </Box>
              <Text as="span" variant="bodySm" tone="subdued" breakWord>
                {content || '—'}
              </Text>
              <Text as="span" variant="bodySm">
                {link ? (
                  <button
                    type="button"
                    className="crm-open-link"
                    onClick={() => openExternalUrl(link)}
                  >
                    Open ↗
                  </button>
                ) : (
                  '—'
                )}
              </Text>
            </InlineGrid>
          </Box>
        );
      })}

      <Box padding="500" className="crm-progress-table__foot">
        <Text as="p" tone="subdued" variant="bodySm">
          Fixed 5 contract periods. Click Edit to update check-ins, content, and links.
        </Text>
      </Box>
    </BlockStack>
  );
}
