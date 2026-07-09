import { InlineGrid } from '@shopify/polaris';
import {
  CalendarIcon,
  PhoneIcon,
  ShieldCheckMarkIcon,
  TeamIcon,
} from '@shopify/polaris-icons';
import {
  formatCompactNumber,
  formatFollowupDate,
  formatLastContactLabel,
  formatRelativeTime,
  getFollowupEmphasis,
  normalizeExternalUrl,
  parseFollowerCount,
  PLATFORM_META,
} from '../constants';
import MetricCard from './MetricCard';

function activePlatformCount(form) {
  return PLATFORM_META.filter(
    (platform) =>
      normalizeExternalUrl(form?.[platform.key]) ||
      parseFollowerCount(form?.[platform.followerField]) > 0
  ).length;
}

export default function CreatorDetailSummaryMetrics({ record, form }) {
  const totalFollowers =
    parseFollowerCount(form.youtube_followers) +
    parseFollowerCount(form.facebook_followers) +
    parseFollowerCount(form.instagram_followers) +
    parseFollowerCount(form.tiktok_followers);

  const platformCount = activePlatformCount(form);
  const verifiedRelative = record?.followers_last_verified_at
    ? formatRelativeTime(record.followers_last_verified_at)
    : 'Never';
  const verifiedBy = record?.followers_verified_by || form.manager_owner || '';
  const verifiedHelp = record?.followers_last_verified_at
    ? `${formatFollowupDate(record.followers_last_verified_at)}${verifiedBy ? ` by ${verifiedBy}` : ''}`
    : 'Updates when counts are saved';
  const followupEmphasis = getFollowupEmphasis(
    form.next_followup_at ? new Date(form.next_followup_at).toISOString() : null
  );
  const lastContact = formatLastContactLabel(
    form.last_contacted_at ? new Date(form.last_contacted_at).toISOString() : null
  );
  const owner = form.manager_owner || record?.followers_verified_by || '';
  const lastContactHelp = form.last_contacted_at
    ? `${formatFollowupDate(form.last_contacted_at)}${owner ? ` by ${owner}` : ''}`
    : 'No contact recorded';

  return (
    <InlineGrid columns={{ xs: 1, sm: 2, lg: 4 }} gap="500" className="crm-detail-metrics">
      <MetricCard
        label="Total Followers"
        value={totalFollowers.toLocaleString('en-US')}
        helpText={
          platformCount > 0
            ? `Across ${platformCount} platform${platformCount === 1 ? '' : 's'}`
            : 'Manual count across platforms'
        }
        iconSource={TeamIcon}
        iconBackground="#EDE9FE"
        iconColor="#7C3AED"
      />
      <MetricCard
        label="Last Verified"
        value={verifiedRelative}
        helpText={verifiedHelp}
        iconSource={ShieldCheckMarkIcon}
        iconBackground="#DCFCE7"
        iconColor="#16A34A"
      />
      <MetricCard
        label="Next Follow-up"
        value={followupEmphasis?.label || 'Not scheduled'}
        helpText={
          form.next_followup_at
            ? formatFollowupDate(new Date(form.next_followup_at).toISOString())
            : 'Set a follow-up date in Relationship'
        }
        iconSource={CalendarIcon}
        iconBackground="#FFEDD5"
        iconColor="#EA580C"
        tone={followupEmphasis?.tone === 'critical' ? 'critical' : 'default'}
      />
      <MetricCard
        label="Last Contact"
        value={lastContact}
        helpText={lastContactHelp}
        iconSource={PhoneIcon}
        iconBackground="#DCFCE7"
        iconColor="#16A34A"
      />
    </InlineGrid>
  );
}
