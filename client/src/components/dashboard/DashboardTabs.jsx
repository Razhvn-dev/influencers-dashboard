import { Box, InlineStack } from '@shopify/polaris';

const TABS = [
  { id: 'all', label: 'All', statusValue: '' },
  { id: 'active', label: 'Active', statusValue: 'Active Ambassador' },
  { id: 'archived', label: 'Archived', statusValue: 'Past Partner' },
];

export default function DashboardTabs({ statusFilter, onStatusFilterChange }) {
  const activeTab =
    statusFilter === 'Active Ambassador'
      ? 'active'
      : statusFilter === 'Past Partner' || statusFilter === 'Rejected'
        ? 'archived'
        : 'all';

  return (
    <Box className="crm-dashboard-tabs">
      <InlineStack gap="500" wrap={false}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`crm-dashboard-tab${activeTab === tab.id ? ' crm-dashboard-tab--active' : ''}`}
            onClick={() => onStatusFilterChange(tab.statusValue)}
          >
            {tab.label}
          </button>
        ))}
      </InlineStack>
    </Box>
  );
}
