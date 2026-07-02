import { Card, InlineGrid, Text } from '@shopify/polaris';

function StatCard({ label, value, tone = 'default' }) {
  const valueTone = tone === 'critical' ? 'critical' : undefined;

  return (
    <Card>
      <Text as="p" variant="bodySm" tone="subdued">
        {label}
      </Text>
      <Text as="p" variant="headingLg" tone={valueTone}>
        {value}
      </Text>
    </Card>
  );
}

export default function StatsCards({ stats, loading }) {
  const display = (value) => (loading ? '—' : Number(value || 0).toLocaleString('en-US'));

  return (
    <InlineGrid columns={{ xs: 1, sm: 2, md: 3 }} gap="400">
      <StatCard label="Total creators" value={display(stats?.total)} />
      <StatCard label="Active / Partnered" value={display(stats?.partnered)} />
      <StatCard label="Ambassador 2 & 3" value={display(stats?.elevated_levels)} />
      <StatCard
        label="Follow-ups due (7 days)"
        value={display(stats?.followups_due_7d)}
        tone={stats?.followups_due_7d > 0 ? 'critical' : 'default'}
      />
      <StatCard label="With affiliate code" value={display(stats?.with_affiliate_code)} />
      <StatCard label="With content logged" value={display(stats?.with_content_logged)} />
    </InlineGrid>
  );
}
