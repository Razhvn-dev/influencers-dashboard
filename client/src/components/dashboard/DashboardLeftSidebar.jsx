import { useCallback, useState } from 'react';
import {
  BlockStack,
  Box,
  Collapsible,
  Icon,
  InlineStack,
  Text,
} from '@shopify/polaris';
import {
  CalendarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ExportIcon,
  PersonIcon,
  StarFilledIcon,
} from '@shopify/polaris-icons';
import { LEVEL_OPTIONS, PLATFORM_META } from '../../constants';
import PlatformIcon from '../PlatformIcon';

const CATEGORY_OPTIONS = LEVEL_OPTIONS.filter((option) => option.value);

export default function DashboardLeftSidebar({
  platformFilter,
  onPlatformFilterChange,
  levelFilter,
  onLevelFilterChange,
  dueFollowupFilter,
  onDueFollowupFilterChange,
  onImport,
  onExport,
  exportDisabled,
  onShowAllCreators,
}) {
  const [platformOpen, setPlatformOpen] = useState(true);
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [engagementOpen, setEngagementOpen] = useState(true);

  const togglePlatform = useCallback(() => setPlatformOpen((open) => !open), []);
  const toggleCategory = useCallback(() => setCategoryOpen((open) => !open), []);
  const toggleEngagement = useCallback(() => setEngagementOpen((open) => !open), []);

  return (
    <aside className="crm-dashboard-sidebar crm-dashboard-sidebar--left">
      <Box className="crm-dashboard-sidebar__brand">
        <Box className="crm-dashboard-sidebar__logo">
          <Icon source={PersonIcon} tone="base" />
        </Box>
        <Text as="p" variant="bodyMd" fontWeight="semibold">
          Influencer Dashboard
        </Text>
      </Box>

      <nav className="crm-dashboard-sidebar__nav" aria-label="Dashboard navigation">
        <button type="button" className="crm-dashboard-nav-item crm-dashboard-nav-item--active">
          <Icon source={PersonIcon} tone="base" />
          <span>Creators</span>
        </button>
        <button type="button" className="crm-dashboard-nav-item" onClick={onImport}>
          <Icon source={CalendarIcon} tone="base" />
          <span>Import CSV</span>
        </button>
        <button
          type="button"
          className="crm-dashboard-nav-item"
          onClick={onExport}
          disabled={exportDisabled}
        >
          <Icon source={ExportIcon} tone="base" />
          <span>Export Excel</span>
        </button>
      </nav>

      <Box className="crm-dashboard-sidebar__section">
        <Text as="h3" variant="bodySm" tone="subdued" fontWeight="semibold">
          Views
        </Text>
        <BlockStack gap="100">
          <button
            type="button"
            className="crm-dashboard-view-item crm-dashboard-view-item--active"
            onClick={onShowAllCreators}
          >
            All Creators
          </button>
          <button type="button" className="crm-dashboard-view-item" disabled>
            <InlineStack gap="200" blockAlign="center">
              <Icon source={StarFilledIcon} tone="subdued" />
              <span>Favorites</span>
            </InlineStack>
          </button>
        </BlockStack>
      </Box>

      <Box className="crm-dashboard-sidebar__section">
        <Text as="h3" variant="bodySm" tone="subdued" fontWeight="semibold">
          Filters
        </Text>

        <FilterSection
          title="Platform"
          open={platformOpen}
          onToggle={togglePlatform}
        >
          <BlockStack gap="050">
            <button
              type="button"
              className={`crm-dashboard-filter-item${platformFilter === '' ? ' crm-dashboard-filter-item--active' : ''}`}
              onClick={() => onPlatformFilterChange('')}
            >
              All platforms
            </button>
            {PLATFORM_META.map((platform) => (
              <button
                key={platform.key}
                type="button"
                className={`crm-dashboard-filter-item${platformFilter === platform.key ? ' crm-dashboard-filter-item--active' : ''}`}
                onClick={() => onPlatformFilterChange(platform.key)}
              >
                <InlineStack gap="200" blockAlign="center" wrap={false}>
                  <PlatformIcon platformKey={platform.key} size="small" withTooltip={false} />
                  <span>{platform.label}</span>
                </InlineStack>
              </button>
            ))}
          </BlockStack>
        </FilterSection>

        <FilterSection title="Category" open={categoryOpen} onToggle={toggleCategory}>
          <BlockStack gap="050">
            <button
              type="button"
              className={`crm-dashboard-filter-item${levelFilter === '' ? ' crm-dashboard-filter-item--active' : ''}`}
              onClick={() => onLevelFilterChange('')}
            >
              All categories
            </button>
            {CATEGORY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`crm-dashboard-filter-item${levelFilter === option.value ? ' crm-dashboard-filter-item--active' : ''}`}
                onClick={() => onLevelFilterChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </BlockStack>
        </FilterSection>

        <FilterSection title="Engagement" open={engagementOpen} onToggle={toggleEngagement}>
          <BlockStack gap="050">
            <button
              type="button"
              className={`crm-dashboard-filter-item${dueFollowupFilter === '' ? ' crm-dashboard-filter-item--active' : ''}`}
              onClick={() => onDueFollowupFilterChange('')}
            >
              All follow-ups
            </button>
            <button
              type="button"
              className={`crm-dashboard-filter-item${dueFollowupFilter === 'due' ? ' crm-dashboard-filter-item--active' : ''}`}
              onClick={() => onDueFollowupFilterChange('due')}
            >
              Due within 7 days
            </button>
          </BlockStack>
        </FilterSection>
      </Box>
    </aside>
  );
}

function FilterSection({ title, open, onToggle, children }) {
  return (
    <Box className="crm-dashboard-filter-group">
      <button type="button" className="crm-dashboard-filter-group__toggle" onClick={onToggle}>
        <InlineStack align="space-between" blockAlign="center" wrap={false}>
          <Text as="span" variant="bodySm" fontWeight="medium">
            {title}
          </Text>
          <Icon source={open ? ChevronDownIcon : ChevronRightIcon} tone="subdued" />
        </InlineStack>
      </button>
      <Collapsible open={open} id={`filter-${title}`}>
        <Box paddingBlockStart="200" paddingBlockEnd="300">
          {children}
        </Box>
      </Collapsible>
    </Box>
  );
}
