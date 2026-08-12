import { formatCompactNumber, formatFollowupDateTime, getPrimaryChannelPlatformKey, previewAmbassadorLevel } from '../../constants';
import CreatorTableAvatar from '../dashboard/CreatorTableAvatar';
import LevelBadge from '../dashboard/LevelBadge';
import PlatformIcon from '../PlatformIcon';
import StatusBadge from '../dashboard/StatusBadge';
import { useTranslation } from '../../i18n/LanguageContext.jsx';

function previewHandle(channel, fallback) {
  const trimmed = String(channel || '').trim();
  if (!trimmed) return fallback;
  return trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
}

export default function CreatorPreviewCard({ form, platformPreview, nextFollowupAt }) {
  const { t } = useTranslation();
  const displayName = form.name.trim() || t('creatorCreate.newCreator');
  const { platforms, primaryChannel } = platformPreview;
  const hasPlatformSignal = platforms.some((platform) => platform.isConnected || platform.followers > 0);
  const ambassadorLevel = hasPlatformSignal ? previewAmbassadorLevel(form) : t('common.notSet');
  const primaryChannelLabel = primaryChannel || t('common.notSelected');
  const primaryChannelKey = primaryChannel ? getPrimaryChannelPlatformKey(primaryChannel) : null;
  const totalFollowers = platforms.reduce((sum, platform) => sum + platform.followers, 0);
  const category = form.niche_category.trim() || t('common.notAdded');
  const region = form.region.trim() || t('common.notAdded');
  const showLevelBadge = hasPlatformSignal && ambassadorLevel !== t('common.notSet');

  return (
    <section className="crm-add-creator__preview-card crm-creator-preview" aria-labelledby="creator-preview-title">
      <div className="crm-creator-preview__card-label">{t('creatorCreate.liveProfile')}</div>
      <div className="crm-creator-preview__identity">
        <CreatorTableAvatar record={{ name: form.name }} emptyInitials="+" className="crm-creator-preview__avatar" />
        <div className="crm-creator-preview__identity-copy">
          <h2 id="creator-preview-title">{displayName}</h2>
          <p>{previewHandle(form.channel, t('creatorCreate.addHandle'))}</p>
        </div>
      </div>
      <div className="crm-creator-preview__badges">
        <StatusBadge status={form.status || 'Applied'} />
        {showLevelBadge ? <LevelBadge level={ambassadorLevel} /> : null}
      </div>
      {primaryChannelKey ? (
        <p className="crm-creator-preview__summary-line">
          <span className="crm-creator-preview__summary-channel">
            <PlatformIcon platformKey={primaryChannelKey} size="summary" withTooltip={false} />
            {primaryChannelLabel}
          </span>
        </p>
      ) : null}
      <dl className="crm-creator-preview__meta-list">
        <div>
          <dt>{t('creatorCreate.category')}</dt>
          <dd>{category}</dd>
        </div>
        <div>
          <dt>{t('creatorCreate.region')}</dt>
          <dd>{region}</dd>
        </div>
        <div>
          <dt>{t('creatorCreate.totalFollowers')}</dt>
          <dd>{formatCompactNumber(totalFollowers)}</dd>
        </div>
        <div>
          <dt>{t('creatorCreate.nextFollowup')}</dt>
          <dd>{formatFollowupDateTime(nextFollowupAt) || t('common.notSet')}</dd>
        </div>
      </dl>
    </section>
  );
}
