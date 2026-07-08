import { Button, InlineStack, Text } from '@shopify/polaris';
import { normalizeExternalUrl } from '../constants';

const PLATFORMS = [
  { key: 'youtube_url', label: 'YouTube' },
  { key: 'instagram_url', label: 'Instagram' },
  { key: 'facebook_url', label: 'Facebook' },
  { key: 'tiktok_url', label: 'TikTok' },
];

export default function SocialProfileButtons({ form }) {
  return (
    <InlineStack gap="200" wrap>
      {PLATFORMS.map(({ key, label }) => {
        const url = normalizeExternalUrl(form[key]);

        return (
          <Button
            key={key}
            url={url || undefined}
            external={Boolean(url)}
            disabled={!url}
            accessibilityLabel={
              url ? `Open ${label} profile` : `${label} profile URL not set`
            }
          >
            {label}
          </Button>
        );
      })}
    </InlineStack>
  );
}

export function FollowerVerificationSummary({ form }) {
  if (!form.followers_last_verified_at) {
    return (
      <Text as="p" tone="subdued" variant="bodySm">
        Follower counts have not been manually verified yet.
      </Text>
    );
  }

  const verifiedBy = form.followers_verified_by
    ? ` by ${form.followers_verified_by}`
    : '';

  return (
    <Text as="p" tone="subdued" variant="bodySm">
      Last verified: {form.followers_last_verified_at}
      {verifiedBy}
    </Text>
  );
}
