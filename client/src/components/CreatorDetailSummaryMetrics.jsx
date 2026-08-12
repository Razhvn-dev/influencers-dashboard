import PlatformIcon from './PlatformIcon';
import {
  formatCompactNumber,
  formatFollowupDate,
  getFollowupEmphasis,
  normalizeExternalUrl,
  parseFollowerCount,
  PLATFORM_META,
} from '../constants';
import { translateFollowupLabel, useTranslation } from '../i18n/LanguageContext.jsx';

function display(value, t) {
  const text = String(value ?? '').trim();
  return text || t('common.notSet');
}

export default function CreatorDetailSummaryMetrics({ form, layout = 'default' }) {
  const { t } = useTranslation();
  const totalFollowers =
    parseFollowerCount(form.youtube_followers) +
    parseFollowerCount(form.facebook_followers) +
    parseFollowerCount(form.instagram_followers) +
    parseFollowerCount(form.tiktok_followers);

  const connectedPlatformList = PLATFORM_META.filter((platform) => {
    const hasProfileUrl = Boolean(normalizeExternalUrl(form[platform.key]));
    const hasFollowerCount = parseFollowerCount(form[platform.followerField]) > 0;
    return hasProfileUrl || hasFollowerCount;
  });

  const followupEmphasis = getFollowupEmphasis(form.next_followup_at);
  const followupDateLabel = form.next_followup_at
    ? formatFollowupDate(form.next_followup_at)
    : t('creatorDetail.notScheduled');

  const items = [
    {
      key: 'followers',
      label: t('creatorDetail.totalFollowers'),
      value: formatCompactNumber(totalFollowers),
      hint:
        connectedPlatformList.length > 0
          ? t('creatorDetail.heroFollowersHint', { count: connectedPlatformList.length })
          : null,
    },
    {
      key: 'platforms',
      label: t('creatorDetail.connectedPlatforms'),
      value: String(connectedPlatformList.length),
      platforms: connectedPlatformList,
    },
    {
      key: 'region',
      label: t('creatorDetail.region'),
      value: display(form.region, t),
    },
    {
      key: 'followup',
      label: t('creatorDetail.nextFollowup'),
      value: followupDateLabel,
      emphasisLabel: followupEmphasis?.tone
        ? translateFollowupLabel(t, followupEmphasis.label)
        : null,
      emphasisTone: followupEmphasis?.tone,
    },
  ];

  return (
    <div
      className={`crm-detail-hero-metrics-grid${
        layout === 'hero-side'
          ? ' crm-detail-hero-metrics-grid--hero-side'
          : layout === 'hero-top'
            ? ' crm-detail-hero-metrics-grid--hero-top'
            : ''
      }`}
      role="list"
      aria-label={t('creatorDetail.heroMetricsLabel')}
    >
      {items.map((item) => (
        <div
          key={item.key}
          className={`crm-detail-hero-metrics-stat${
            item.emphasisTone ? ` crm-detail-hero-metrics-stat--${item.emphasisTone}` : ''
          }`}
          role="listitem"
        >
          {item.platforms?.length ? (
            <>
              <span className="crm-detail-hero-metrics-stat__value">{item.value}</span>
              <div className="crm-detail-hero-metrics-stat__platforms" aria-hidden="true">
                {item.platforms.map((platform) => (
                  <PlatformIcon
                    key={platform.key}
                    platformKey={platform.key}
                    size="summary"
                    withTooltip={false}
                  />
                ))}
              </div>
            </>
          ) : (
            <span className="crm-detail-hero-metrics-stat__value">{item.value}</span>
          )}
          {item.emphasisLabel ? (
            <span className={`crm-detail-hero-metrics-stat__badge crm-detail-hero-metrics-stat__badge--${item.emphasisTone}`}>
              {item.emphasisLabel}
            </span>
          ) : null}
          {item.hint ? (
            <span className="crm-detail-hero-metrics-stat__hint">{item.hint}</span>
          ) : null}
          <span className="crm-detail-hero-metrics-stat__label">
            {item.platforms?.length
              ? t('creatorDetail.heroPlatformsLabel', { count: item.platforms.length })
              : item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
