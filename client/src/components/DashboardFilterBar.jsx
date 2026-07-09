import { useCallback, useState } from 'react';
import { BlockStack, Box, Icon, InlineStack, Popover, Select } from '@shopify/polaris';
import { FilterIcon } from '@shopify/polaris-icons';
import {
  COMMISSION_FILTER_OPTIONS,
  DUE_FOLLOWUP_FILTER_OPTIONS,
  LEVEL_OPTIONS,
  PLATFORM_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
} from '../constants';

export default function DashboardFilterBar({
  statusFilter,
  onStatusFilterChange,
  levelFilter,
  onLevelFilterChange,
  platformFilter,
  onPlatformFilterChange,
  dueFollowupFilter,
  onDueFollowupFilterChange,
  commissionFilter,
  onCommissionFilterChange,
  hasActiveFilters,
  onClearFilters,
}) {
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);

  const toggleMoreFilters = useCallback(
    () => setMoreFiltersOpen((open) => !open),
    []
  );

  const moreFiltersActive = Boolean(commissionFilter);

  return (
    <Box className="crm-v2-toolbar">
      <InlineStack gap="400" blockAlign="end" wrap={false}>
        <Box className="crm-v2-toolbar__field">
          <Select
            label="Status"
            options={STATUS_FILTER_OPTIONS}
            value={statusFilter}
            onChange={onStatusFilterChange}
          />
        </Box>
        <Box className="crm-v2-toolbar__field">
          <Select
            label="Ambassador Level"
            options={LEVEL_OPTIONS}
            value={levelFilter}
            onChange={onLevelFilterChange}
          />
        </Box>
        <Box className="crm-v2-toolbar__field">
          <Select
            label="Platform"
            options={PLATFORM_FILTER_OPTIONS}
            value={platformFilter}
            onChange={onPlatformFilterChange}
          />
        </Box>
        <Box className="crm-v2-toolbar__field">
          <Select
            label="Next Follow-up"
            options={DUE_FOLLOWUP_FILTER_OPTIONS}
            value={dueFollowupFilter}
            onChange={onDueFollowupFilterChange}
          />
        </Box>

        <Box className="crm-v2-toolbar__actions">
          <Popover
            active={moreFiltersOpen}
            activator={
              <button
                type="button"
                className={`crm-v2-toolbar-link${moreFiltersActive ? ' crm-v2-toolbar-link--active' : ''}`}
                onClick={toggleMoreFilters}
              >
                <Icon source={FilterIcon} tone="subdued" />
                <span>More filters</span>
              </button>
            }
            onClose={toggleMoreFilters}
            preferredAlignment="right"
            preferredPosition="below"
          >
            <Box padding="500" minWidth="280px" className="crm-v2-toolbar__popover">
              <BlockStack gap="200">
                <Select
                  label="Commission"
                  options={COMMISSION_FILTER_OPTIONS}
                  value={commissionFilter}
                  onChange={onCommissionFilterChange}
                />
              </BlockStack>
            </Box>
          </Popover>

          <button
            type="button"
            className="crm-v2-toolbar-link crm-v2-toolbar-link--muted"
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
          >
            Clear filters
          </button>
        </Box>
      </InlineStack>
    </Box>
  );
}
