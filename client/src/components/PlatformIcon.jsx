import { Box, Icon, Tooltip } from '@shopify/polaris';
import { getPlatformMeta } from '../constants';
import {
  FacebookIcon,
  InstagramIcon,
  TiktokIcon,
  YoutubeIcon,
} from '../icons/platformIconSources';

const ICON_SOURCES = {
  youtube_url: YoutubeIcon,
  instagram_url: InstagramIcon,
  facebook_url: FacebookIcon,
  tiktok_url: TiktokIcon,
};

export default function PlatformIcon({
  platformKey,
  size = 'medium',
  withTooltip = true,
}) {
  const platform = getPlatformMeta(platformKey);
  const source = ICON_SOURCES[platformKey];

  if (!platform || !source) {
    return null;
  }

  const dimension =
    size === 'small' ? '24px' : size === 'large' ? '32px' : '28px';
  const iconSize = size === 'large' ? '16px' : '14px';

  const icon = (
    <Box
      className="crm-platform-icon"
      style={{
        width: dimension,
        height: dimension,
        background: platform.iconBackground,
        color: platform.iconColor,
        '--crm-platform-icon-size': iconSize,
      }}
    >
      <Icon source={source} accessibilityLabel={platform.label} />
    </Box>
  );

  if (!withTooltip) {
    return icon;
  }

  return <Tooltip content={platform.label}>{icon}</Tooltip>;
}
