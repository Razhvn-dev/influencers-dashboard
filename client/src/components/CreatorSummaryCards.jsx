import { Badge, BlockStack, Box, Card, InlineGrid, Text } from '@shopify/polaris';
import {
  displayAmbassadorLevel,
  formatRelativeTime,
  levelTone,
  parseFollowerCount,
} from '../constants';

function SummaryCard({ label, children }) {
  return (
    <Card padding="400">
      <BlockStack gap="200">
        <Text as="p" variant="bodySm" tone="subdued">
          {label}
        </Text>
        {children}
      </BlockStack>
    </Card>
  );
}

export default function CreatorSummaryCards({ record, form, ambassadorLevel }) {
  const totalFollowers =
    parseFollowerCount(form.youtube_followers) +
    parseFollowerCount(form.facebook_followers) +
    parseFollowerCount(form.instagram_followers) +
    parseFollowerCount(form.tiktok_followers);

  const verifiedRelative = record?.followers_last_verified_at
    ? formatRelativeTime(record.followers_last_verified_at)
    : '';
  const verifiedBy = record?.followers_verified_by;

  return (
    <InlineGrid columns={{ xs: 1, sm: 3 }} gap="300">
      <SummaryCard label="Ambassador Level">
        <Badge tone={levelTone(ambassadorLevel)}>
          {displayAmbassadorLevel(ambassadorLevel)}
        </Badge>
      </SummaryCard>

      <SummaryCard label="Total Followers">
        <Text as="p" variant="headingXl" fontWeight="bold">
          {totalFollowers.toLocaleString('en-US')}
        </Text>
        <Text as="p" variant="bodySm" tone="subdued">
          Manual count across all platforms
        </Text>
      </SummaryCard>

      <SummaryCard label="Last Verified">
        {verifiedRelative ? (
          <BlockStack gap="100">
            <Text as="p" variant="headingMd" fontWeight="semibold">
              {verifiedRelative}
            </Text>
            {verifiedBy ? (
              <Text as="p" variant="bodySm" tone="subdued">
                by {verifiedBy}
              </Text>
            ) : null}
            <Text as="p" variant="bodySm" tone="subdued">
              {form.followers_last_verified_at}
            </Text>
          </BlockStack>
        ) : (
          <Box paddingBlockStart="100">
            <Text as="p" variant="bodyMd" tone="subdued">
              Not verified yet
            </Text>
          </Box>
        )}
      </SummaryCard>
    </InlineGrid>
  );
}
