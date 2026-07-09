import {
  formatCompactNumber,
  formatFollowupDateTime,
  getPrimaryChannelPlatformKey,
  previewAmbassadorLevel,
} from '../../constants';
import CreatorTableAvatar from '../dashboard/CreatorTableAvatar';
import LevelBadge from '../dashboard/LevelBadge';
import PlatformIcon from '../PlatformIcon';
import StatusBadge from '../dashboard/StatusBadge';

function previewHandle(channel) {
  const trimmed = String(channel || '').trim();
  if (!trimmed) return '—';
  if (trimmed.startsWith('@')) return trimmed;
  return `@${trimmed}`;
}

function PreviewMetaBlock({ label, value, iconKey }) {
  return (
    <div className="crm-add-creator-preview__meta-block">
      <span className="crm-add-creator-preview__meta-label">{label}</span>
      <span className="crm-add-creator-preview__meta-value">
        {iconKey ? (
          <PlatformIcon platformKey={iconKey} size="summary" withTooltip={false} />
        ) : null}
        {value}
      </span>
    </div>
  );
}

export default function AddCreatorPreviewPanel({ form, platformPreview, nextFollowupAt }) {
  const displayName = form.name.trim() || 'New Creator';
  const handle = previewHandle(form.channel);
  const { platforms, primaryChannel, connectedPlatformsCount } = platformPreview;
  const primaryChannelLabel = primaryChannel || 'Not selected';
  const primaryChannelIconKey =
    primaryChannelLabel === 'Not selected'
      ? null
      : getPrimaryChannelPlatformKey(primaryChannelLabel);
  const nextFollowupLabel = formatFollowupDateTime(nextFollowupAt) || 'None';
  const ambassadorLevel = previewAmbassadorLevel(form);
  const totalFollowers = platforms.reduce((sum, platform) => sum + platform.followers, 0);
  const hasPlatformSignal = platforms.some((platform) => platform.isConnected || platform.followers > 0);

  return (
    <div className="crm-add-creator__preview-stack">
      <section className="crm-add-creator__preview-card">
        <h3 className="crm-add-creator__preview-title">Creator Preview</h3>
        <div className="crm-add-creator-preview__identity">
          <CreatorTableAvatar
            record={{ name: form.name }}
            emptyInitials="+"
            className="crm-add-creator-preview__avatar"
          />
          <div className="crm-add-creator-preview__identity-text">
            <p className="crm-add-creator-preview__name">{displayName}</p>
            <p className="crm-add-creator-preview__handle">{handle}</p>
          </div>
        </div>
        <div
          className={`crm-add-creator-preview__badge-row${hasPlatformSignal ? '' : ' crm-add-creator-preview__badge-row--muted'}`}
        >
          <StatusBadge status={form.status || 'Applied'} />
          <LevelBadge level={ambassadorLevel} />
        </div>
        <hr className="crm-add-creator-preview__divider" />
        <div className="crm-add-creator-preview__meta">
          <PreviewMetaBlock
            label="Primary Channel"
            value={primaryChannelLabel}
            iconKey={primaryChannelIconKey}
          />
          <PreviewMetaBlock
            label="Ambassador Level"
            value={ambassadorLevel}
          />
          <PreviewMetaBlock
            label="Total Followers"
            value={formatCompactNumber(totalFollowers)}
          />
          <PreviewMetaBlock label="Region" value={form.region.trim() || 'Not set'} />
          <PreviewMetaBlock label="Next Follow-up" value={nextFollowupLabel} />
        </div>
        <p className="crm-add-creator-preview__hint">
          Ambassador Level, Primary Channel, and Total Followers update automatically from
          platform follower counts.
        </p>
      </section>

      <section className="crm-add-creator__preview-card">
        <h3 className="crm-add-creator__preview-title">Platform Summary</h3>
        <ul className="crm-add-creator-preview__platform-list">
          {platforms.map((platform) => (
            <li key={platform.key} className="crm-add-creator-preview__platform-item">
              <span className="crm-add-creator-preview__platform-item-label">
                <PlatformIcon platformKey={platform.key} size="summary" withTooltip={false} />
                {platform.label}
              </span>
              <span className="crm-add-creator-preview__platform-item-leader" aria-hidden="true" />
              <span className="crm-add-creator-preview__platform-item-count">
                {platform.followerDisplay}
              </span>
            </li>
          ))}
        </ul>
        <p className="crm-add-creator-preview__hint">
          {connectedPlatformsCount > 0
            ? `${connectedPlatformsCount} connected platform${connectedPlatformsCount === 1 ? '' : 's'}`
            : 'Add follower counts or links to connect platforms.'}
        </p>
      </section>
    </div>
  );
}
