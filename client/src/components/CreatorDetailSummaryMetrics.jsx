import {
  ContractIcon,
  PersonIcon,
  ShieldCheckMarkIcon,
} from '@shopify/polaris-icons';
import {
  formatCompactNumber,
  formatFollowupDate,
  formatRelativeTime,
  parseFollowerCount,
} from '../constants';
import DetailMetricCard from './DetailMetricCard';

function display(value) {
  const text = String(value ?? '').trim();
  return text || 'Not set';
}

export default function CreatorDetailSummaryMetrics({ record, form }) {
  const verifiedRelative = record?.followers_last_verified_at
    ? formatRelativeTime(record.followers_last_verified_at)
    : 'Never';
  const verifiedBy = record?.followers_verified_by || form.manager_owner || '';
  const verifiedHelp = record?.followers_last_verified_at
    ? `${formatFollowupDate(record.followers_last_verified_at)}${verifiedBy ? ` · ${verifiedBy}` : ''}`
    : 'Updates when counts are saved';

  const totalFollowers =
    parseFollowerCount(form.youtube_followers) +
    parseFollowerCount(form.facebook_followers) +
    parseFollowerCount(form.instagram_followers) +
    parseFollowerCount(form.tiktok_followers);

  const contractHelp = String(form.commission ?? '').trim() === 'NO'
    ? 'No commission'
    : String(form.commission ?? '').trim() || '';

  return (
    <div className="crm-detail-kpi-grid">
      <DetailMetricCard
        label="Contract"
        value={display(form.contract_status)}
        helpText={contractHelp}
        iconSource={ContractIcon}
        iconBackground="#E0E7FF"
        iconColor="#4338CA"
      />
      <DetailMetricCard
        label="Last Verified"
        value={verifiedRelative}
        helpText={verifiedHelp}
        iconSource={ShieldCheckMarkIcon}
        iconBackground="#DCFCE7"
        iconColor="#16A34A"
      />
      <DetailMetricCard
        label="Total Followers"
        value={formatCompactNumber(totalFollowers)}
        helpText="Across connected platforms"
        iconSource={PersonIcon}
        iconBackground="#DBEAFE"
        iconColor="#2563EB"
      />
    </div>
  );
}
