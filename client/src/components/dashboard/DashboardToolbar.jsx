import { useCallback, useState } from 'react';
import {
  Box,
  Button,
  Icon,
  InlineStack,
  Popover,
  Select,
  TextField,
} from '@shopify/polaris';
import { ExportIcon, FilterIcon, SearchIcon } from '@shopify/polaris-icons';
import {
  COMMISSION_FILTER_OPTIONS,
  LEVEL_OPTIONS,
  PLATFORM_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
} from '../../constants';

export default function DashboardToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  levelFilter,
  onLevelFilterChange,
  platformFilter,
  onPlatformFilterChange,
  commissionFilter,
  onCommissionFilterChange,
  dueFollowupFilter,
  onDueFollowupFilterChange,
  hasActiveFilters,
  onClearFilters,
  onExport,
  exportDisabled,
}) {
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const toggleMoreFilters = useCallback(
    () => setMoreFiltersOpen((open) => !open),
    []
  );
  const moreFiltersActive = Boolean(commissionFilter || dueFollowupFilter);

  return (
    <Box className="crm-dashboard-toolbar">
      <Box className="crm-dashboard-toolbar__search">
        <TextField
          label="Search creators"
          labelHidden
          value={search}
          onChange={onSearchChange}
          placeholder="Search creators..."
          autoComplete="off"
          prefix={<Icon source={SearchIcon} tone="subdued" />}
          clearButton
          onClearButtonClick={() => onSearchChange('')}
        />
      </Box>

      <InlineStack align="space-between" blockAlign="end" wrap={false} gap="400">
        <InlineStack gap="300" wrap blockAlign="end" className="crm-dashboard-toolbar__filters">
          <Box minWidth="140px" maxWidth="160px">
            <Select
              label="Category"
              options={LEVEL_OPTIONS}
              value={levelFilter}
              onChange={onLevelFilterChange}
            />
          </Box>
          <Box minWidth="140px" maxWidth="160px">
            <Select
              label="Status"
              options={STATUS_FILTER_OPTIONS}
              value={statusFilter}
              onChange={onStatusFilterChange}
            />
          </Box>
          <Box minWidth="140px" maxWidth="160px">
            <Select
              label="Platform"
              options={PLATFORM_FILTER_OPTIONS}
              value={platformFilter}
              onChange={onPlatformFilterChange}
            />
          </Box>
        </InlineStack>

        <InlineStack gap="300" wrap={false} blockAlign="center">
          <Popover
            active={moreFiltersOpen}
            activator={
              <button
                type="button"
                className={`crm-filter-link${moreFiltersActive ? ' crm-filter-link--active' : ''}`}
                onClick={toggleMoreFilters}
              >
                <Icon source={FilterIcon} tone="subdued" />
                <span>More filters</span>
              </button>
            }
            onClose={toggleMoreFilters}
            preferredAlignment="right"
          >
            <Box padding="400" minWidth="260px">
              <InlineStack gap="400" wrap={false}>
                <Box minWidth="220px">
                  <Select
                    label="Commission"
                    options={COMMISSION_FILTER_OPTIONS}
                    value={commissionFilter}
                    onChange={onCommissionFilterChange}
                  />
                </Box>
              </InlineStack>
              <Box paddingBlockStart="300">
                <Select
                  label="Next Follow-up"
                  options={[
                    { label: 'All follow-ups', value: '' },
                    { label: 'Due within 7 days', value: 'due' },
                  ]}
                  value={dueFollowupFilter}
                  onChange={onDueFollowupFilterChange}
                />
              </Box>
            </Box>
          </Popover>
          {hasActiveFilters ? (
            <button type="button" className="crm-filter-link" onClick={onClearFilters}>
              Clear filters
            </button>
          ) : null}
          <Button icon={ExportIcon} onClick={onExport} disabled={exportDisabled}>
            Export Excel
          </Button>
        </InlineStack>
      </InlineStack>
    </Box>
  );
}
