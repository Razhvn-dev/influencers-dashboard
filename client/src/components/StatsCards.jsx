import { InlineGrid } from '@shopify/polaris';
import {
  ChatIcon,
  ContractIcon,
  PersonIcon,
  StatusActiveIcon,
  TargetIcon,
} from '@shopify/polaris-icons';
import { formatCompactNumber } from '../constants';
import MetricCard from './MetricCard';

export default function StatsCards({ stats, loading }) {
  const displayCount = (value) => Number(value || 0).toLocaleString('en-US');

  return (
    <InlineGrid columns={{ xs: 1, sm: 2, md: 3, xl: 5 }} gap="400">
      <MetricCard
        label="Total creators"
        value={displayCount(stats?.total)}
        helpText="All creators in the system"
        iconSource={PersonIcon}
        iconBackground="#EDE9FE"
        iconColor="#7C3AED"
        loading={loading}
      />
      <MetricCard
        label="Active influencers"
        value={displayCount(stats?.partnered)}
        helpText="Currently partnered creators"
        iconSource={StatusActiveIcon}
        iconBackground="#DCFCE7"
        iconColor="#16A34A"
        loading={loading}
      />
      <MetricCard
        label="In discussion"
        value={displayCount(stats?.in_discussion)}
        helpText="Active conversations"
        iconSource={ChatIcon}
        iconBackground="#FEF3C7"
        iconColor="#D97706"
        loading={loading}
      />
      <MetricCard
        label="Contract signed"
        value={displayCount(stats?.contract_signed)}
        helpText="Signed agreements"
        iconSource={ContractIcon}
        iconBackground="#DBEAFE"
        iconColor="#2563EB"
        loading={loading}
      />
      <MetricCard
        label="Total followers"
        value={formatCompactNumber(stats?.total_followers_sum)}
        helpText="Across all platforms"
        iconSource={TargetIcon}
        iconBackground="#EDE9FE"
        iconColor="#7C3AED"
        loading={loading}
      />
    </InlineGrid>
  );
}
