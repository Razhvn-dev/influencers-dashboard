import { InlineStack, Text } from '@shopify/polaris';
import { normalizeExternalUrl, PLATFORM_META } from '../constants';
import PlatformIcon from './PlatformIcon';

function hasPlatformPresence(record, platform) {
  if (normalizeExternalUrl(record?.[platform.key])) return true;
  return Number(record?.[platform.followerField] || 0) > 0;
}

export default function PlatformIndicators({ record, showEmpty = false, size = 'medium' }) {
  const activePlatforms = PLATFORM_META.filter((platform) =>
    hasPlatformPresence(record, platform)
  );

  if (activePlatforms.length === 0) {
    return showEmpty ? (
      <Text as="span" tone="subdued" variant="bodySm">
        —
      </Text>
    ) : null;
  }

  return (
    <InlineStack gap="200" wrap={false} blockAlign="center" className="crm-platform-indicators">
      {activePlatforms.map((platform) => (
        <PlatformIcon key={platform.key} platformKey={platform.key} size={size} />
      ))}
    </InlineStack>
  );
}
