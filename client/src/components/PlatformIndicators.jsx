import { InlineStack, Text } from '@shopify/polaris';
import { normalizeExternalUrl, PLATFORM_META } from '../constants';
import PlatformIcon from './PlatformIcon';

export default function PlatformIndicators({ record, showEmpty = false, size = 'medium' }) {
  const activePlatforms = PLATFORM_META.filter((platform) =>
    normalizeExternalUrl(record?.[platform.key])
  );

  if (activePlatforms.length === 0) {
    return showEmpty ? (
      <Text as="span" tone="subdued" variant="bodySm">
        —
      </Text>
    ) : null;
  }

  return (
    <InlineStack gap="300" wrap={false} blockAlign="center">
      {activePlatforms.map((platform) => (
        <PlatformIcon key={platform.key} platformKey={platform.key} size={size} />
      ))}
    </InlineStack>
  );
}
