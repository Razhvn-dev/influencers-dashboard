import { creatorHandle, creatorPrimaryName, formatCompactNumber, formatFollowupDate, getFollowupEmphasis, normalizeExternalUrl, PLATFORM_META } from '../../constants';
import { translateFollowupLabel, useTranslation } from '../../i18n/LanguageContext.jsx';
import PlatformIcon from '../PlatformIcon';
import CreatorTableAvatar from '../dashboard/CreatorTableAvatar';
import LevelBadge from '../dashboard/LevelBadge';
import StatusBadge from '../dashboard/StatusBadge';

function connectedPlatforms(record) {
  return PLATFORM_META.filter(
    (platform) => Boolean(normalizeExternalUrl(record?.[platform.key])) || Number(record?.[platform.followerField] || 0) > 0
  );
}

export default function CreatorMobileCard({ record, onNavigate }) {
  const { t } = useTranslation();
  const platforms = connectedPlatforms(record);
  const followup = getFollowupEmphasis(record.next_followup_at);

  return (
    <button type="button" className="crm-creator-mobile-card" onClick={onNavigate} aria-label={t('creatorList.viewCreator', { name: creatorPrimaryName(record) })}>
      <span className="crm-creator-mobile-card__header">
        <CreatorTableAvatar record={record} />
        <span className="crm-creator-mobile-card__identity">
          <span className="crm-creator-mobile-card__name">{creatorPrimaryName(record)}</span>
          <span className="crm-creator-mobile-card__handle">{creatorHandle(record)}</span>
        </span>
      </span>
      <span className="crm-creator-mobile-card__metrics">
        <span className="crm-creator-mobile-card__metric">
          <span className="crm-creator-mobile-card__label">{t('dashboard.columns.platforms')}</span>
          <span className="crm-creator-mobile-card__platforms">
            {platforms.length > 0
              ? platforms.slice(0, 2).map((platform) => (
                  <span key={platform.key} className="crm-creator-mobile-card__platform">
                    <PlatformIcon platformKey={platform.key} size="small" withTooltip={false} />
                    {platform.label}
                  </span>
                ))
              : t('creatorList.noChannels')}
          </span>
        </span>
        <span className="crm-creator-mobile-card__metric">
          <span className="crm-creator-mobile-card__label">{t('dashboard.columns.followers')}</span>
          <span className="crm-creator-mobile-card__followers">{formatCompactNumber(record.total_followers)}</span>
        </span>
      </span>
      <span className="crm-creator-mobile-card__badges">
        <StatusBadge status={record.status} />
        <LevelBadge level={record.ambassador_level} />
      </span>
      <span className="crm-creator-mobile-card__followup">
        <span>{t('dashboard.columns.nextFollowup')}</span>
        {record.next_followup_at && followup ? (
          <span className="crm-creator-mobile-card__followup-value">
            {followup.tone ? (
              <span className={followup.tone === 'critical' ? 'crm-followup-overdue' : 'crm-contact-primary'}>
                {translateFollowupLabel(t, followup.label)}
              </span>
            ) : null}
            <span>{formatFollowupDate(record.next_followup_at)}</span>
          </span>
        ) : <span className="crm-table-muted">—</span>}
      </span>
    </button>
  );
}
