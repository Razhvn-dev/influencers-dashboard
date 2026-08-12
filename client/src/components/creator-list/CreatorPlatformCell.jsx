import { PLATFORM_META, normalizeExternalUrl } from '../../constants';
import { useTranslation } from '../../i18n/LanguageContext.jsx';
import PlatformIcon from '../PlatformIcon';

function isConnected(record, platform) {
  return Boolean(normalizeExternalUrl(record?.[platform.key])) || Number(record?.[platform.followerField] || 0) > 0;
}

const MAX_VISIBLE_ICONS = 3;

export default function CreatorPlatformCell({ record }) {
  const { t } = useTranslation();
  const connectedPlatforms = PLATFORM_META.filter((platform) => isConnected(record, platform));

  if (connectedPlatforms.length === 0) {
    return <span className="crm-resource-platforms__empty">{t('creatorList.noChannels')}</span>;
  }

  const visiblePlatforms = connectedPlatforms.slice(0, MAX_VISIBLE_ICONS);
  const overflowCount = connectedPlatforms.length - visiblePlatforms.length;
  const platformSummary = connectedPlatforms
    .map((platform) => `${platform.label} · ${t('creatorList.connected')}`)
    .join(', ');

  return (
    <div
      className="crm-resource-platforms crm-resource-platforms--compact"
      aria-label={platformSummary}
      title={platformSummary}
    >
      {visiblePlatforms.map((platform) => (
        <span key={platform.key} className="crm-resource-platforms__icon-wrap">
          <PlatformIcon platformKey={platform.key} size="small" withTooltip={false} />
        </span>
      ))}
      {overflowCount > 0 ? (
        <span className="crm-resource-platforms__count">+{overflowCount}</span>
      ) : null}
    </div>
  );
}
