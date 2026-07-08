import { useMemo } from 'react';
import {
  BlockStack,
  Box,
  InlineGrid,
  InlineStack,
  Spinner,
  Text,
} from '@shopify/polaris';
import { formatCompactNumber, formatRelativeTime, getFollowupEmphasis } from '../../constants';

export default function DashboardRightSidebar({ stats, records, loading }) {
  const displayCount = (value) => Number(value || 0).toLocaleString('en-US');

  const activeRate = useMemo(() => {
    const total = Number(stats?.total || 0);
    const active = Number(stats?.partnered || 0);
    if (!total) return '0%';
    return `${Math.round((active / total) * 100)}%`;
  }, [stats]);

  const recentActivity = useMemo(() => {
    return [...records]
      .sort((a, b) => Number(b.id) - Number(a.id))
      .slice(0, 5)
      .map((record) => ({
        id: record.id,
        name: record.name,
        detail: record.status ? `Status updated to ${record.status}` : 'Creator profile updated',
        time: record.last_contacted_at
          ? formatRelativeTime(record.last_contacted_at)
          : 'Recently added',
        tone:
          record.status === 'Active Ambassador' || record.status === 'Partnered'
            ? 'success'
            : record.status === 'Rejected'
              ? 'critical'
              : 'info',
      }));
  }, [records]);

  const upcomingFollowups = useMemo(() => {
    return [...records]
      .filter((record) => record.next_followup_at)
      .sort(
        (a, b) => new Date(a.next_followup_at).getTime() - new Date(b.next_followup_at).getTime()
      )
      .slice(0, 4)
      .map((record) => ({
        id: record.id,
        name: record.name,
        emphasis: getFollowupEmphasis(record.next_followup_at),
      }));
  }, [records]);

  return (
    <aside className="crm-dashboard-sidebar crm-dashboard-sidebar--right">
      <Box className="crm-dashboard-panel crm-dashboard-panel--stats">
        <InlineGrid columns={2} gap="300">
          <Box className="crm-dashboard-mini-stat crm-dashboard-mini-stat--green">
            <Text as="p" variant="bodySm" tone="subdued">
              Total Creators
            </Text>
            <Text as="p" variant="headingLg" fontWeight="bold">
              {loading ? '—' : displayCount(stats?.total)}
            </Text>
          </Box>
          <Box className="crm-dashboard-mini-stat crm-dashboard-mini-stat--green">
            <Text as="p" variant="bodySm" tone="subdued">
              In Talks
            </Text>
            <Text as="p" variant="headingLg" fontWeight="bold">
              {loading ? '—' : displayCount(stats?.in_discussion)}
            </Text>
          </Box>
          <Box className="crm-dashboard-mini-stat crm-dashboard-mini-stat--green">
            <Text as="p" variant="bodySm" tone="subdued">
              Active
            </Text>
            <Text as="p" variant="headingLg" fontWeight="bold">
              {loading ? '—' : displayCount(stats?.partnered)}
            </Text>
          </Box>
          <Box className="crm-dashboard-mini-stat crm-dashboard-mini-stat--green">
            <Text as="p" variant="bodySm" tone="subdued">
              Total Followers
            </Text>
            <Text as="p" variant="headingLg" fontWeight="bold">
              {loading ? '—' : formatCompactNumber(stats?.total_followers_sum)}
            </Text>
          </Box>
        </InlineGrid>
      </Box>

      <Box className="crm-dashboard-panel">
        <Text as="h3" variant="headingSm" fontWeight="semibold">
          Recent Activity
        </Text>
        <BlockStack gap="400">
          {loading ? (
            <InlineStack align="center">
              <Spinner size="small" />
            </InlineStack>
          ) : recentActivity.length === 0 ? (
            <Text as="p" tone="subdued" variant="bodySm">
              No recent activity yet.
            </Text>
          ) : (
            recentActivity.map((item) => (
              <Box key={item.id} className="crm-dashboard-activity-item">
                <InlineStack gap="300" blockAlign="start" wrap={false}>
                  <span className={`crm-dashboard-activity-dot crm-dashboard-activity-dot--${item.tone}`} />
                  <BlockStack gap="050">
                    <Text as="p" variant="bodySm" fontWeight="semibold">
                      {item.name}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {item.detail}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {item.time}
                    </Text>
                  </BlockStack>
                </InlineStack>
              </Box>
            ))
          )}
        </BlockStack>
      </Box>

      {upcomingFollowups.length > 0 ? (
        <Box className="crm-dashboard-panel">
          <Text as="h3" variant="headingSm" fontWeight="semibold">
            Upcoming Follow-ups
          </Text>
          <BlockStack gap="300">
            {upcomingFollowups.map((item) => (
              <InlineStack key={item.id} align="space-between" blockAlign="center" wrap={false}>
                <Text as="span" variant="bodySm" fontWeight="medium">
                  {item.name}
                </Text>
                <Text
                  as="span"
                  variant="bodySm"
                  fontWeight="semibold"
                  className={
                    item.emphasis?.tone === 'critical'
                      ? 'crm-followup-overdue'
                      : item.emphasis?.tone === 'warning'
                        ? 'crm-followup-soon'
                        : item.emphasis?.tone === 'success'
                          ? 'crm-followup-positive'
                          : undefined
                  }
                >
                  {item.emphasis?.label || '—'}
                </Text>
              </InlineStack>
            ))}
          </BlockStack>
        </Box>
      ) : null}

      <Box className="crm-dashboard-panel crm-dashboard-panel--footer-stats">
        <InlineGrid columns={3} gap="200">
          <Box className="crm-dashboard-footer-stat">
            <Text as="p" variant="headingMd" fontWeight="bold">
              {loading ? '—' : activeRate}
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              Active rate
            </Text>
          </Box>
          <Box className="crm-dashboard-footer-stat">
            <Text as="p" variant="headingMd" fontWeight="bold">
              {loading ? '—' : displayCount(stats?.in_discussion)}
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              In talks
            </Text>
          </Box>
          <Box className="crm-dashboard-footer-stat">
            <Text as="p" variant="headingMd" fontWeight="bold">
              {loading ? '—' : displayCount(stats?.contract_signed)}
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              Signed
            </Text>
          </Box>
        </InlineGrid>
      </Box>
    </aside>
  );
}
