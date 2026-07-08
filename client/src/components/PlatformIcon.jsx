import { Box, Tooltip } from '@shopify/polaris';
import { getPlatformMeta } from '../constants';

const ICON_IMAGES = {
  youtube_url: '/icons/youtube.png',
  instagram_url: '/icons/instagram.png',
  facebook_url: '/icons/facebook.png',
  tiktok_url: '/icons/tiktok.png',
};

const SIZE_CONFIG = {
  small: { wrapper: '24px', image: '14px' },
  summary: { wrapper: '22px', image: '16px' },
  table: { wrapper: '40px', image: '22px' },
  medium: { wrapper: '24px', image: '14px' },
  large: { wrapper: '32px', image: '16px' },
  xlarge: { wrapper: '34px', image: '18px' },
};

export default function PlatformIcon({
  platformKey,
  size = 'medium',
  withTooltip = true,
}) {
  const platform = getPlatformMeta(platformKey);
  const imageSrc = ICON_IMAGES[platformKey];
  const dimensions = SIZE_CONFIG[size] || SIZE_CONFIG.medium;

  if (!platform || !imageSrc) {
    return null;
  }

  const icon = (
    <Box
      className="crm-platform-icon"
      style={{
        width: dimensions.wrapper,
        height: dimensions.wrapper,
        background: platform.iconBackground,
      }}
    >
      <img
        src={imageSrc}
        alt=""
        className="crm-platform-icon__image"
        style={{
          width: dimensions.image,
          height: dimensions.image,
        }}
        aria-hidden="true"
      />
    </Box>
  );

  if (!withTooltip) {
    return icon;
  }

  return <Tooltip content={platform.label}>{icon}</Tooltip>;
}
