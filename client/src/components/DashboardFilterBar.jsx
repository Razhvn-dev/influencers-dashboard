import { useCallback, useState } from 'react';
import {
  Box,
  Button,
  InlineStack,
  Popover,
  Select,
} from '@shopify/polaris';
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
    <Box className="crm-filter-toolbar">
      <InlineStack align="space-between" blockAlign="end" wrap={false} gap="400">
        <InlineStack gap="400" wrap blockAlign="end">
          <Box minWidth="160px" width="100%" maxWidth="180px">
            <Select
              label="Status"
              options={STATUS_FILTER_OPTIONS}
              value={statusFilter}
              onChange={onStatusFilterChange}
            />
          </Box>
          <Box minWidth="160px" width="100%" maxWidth="190px">
            <Select
              label="Ambassador Level"
              options={LEVEL_OPTIONS}
              value={levelFilter}
              onChange={onLevelFilterChange}
            />
          </Box>
          <Box minWidth="160px" width="100%" maxWidth="180px">
            <Select
              label="Platform"
              options={PLATFORM_FILTER_OPTIONS}
              value={platformFilter}
              onChange={onPlatformFilterChange}
            />
          </Box>
          <Box minWidth="160px" width="100%" maxWidth="190px">
            <Select
              label="Due follow-up"
              options={DUE_FOLLOWUP_FILTER_OPTIONS}
              value={dueFollowupFilter}
              onChange={onDueFollowupFilterChange}
            />
          </Box>
        </InlineStack>

        <InlineStack gap="300" blockAlign="center" wrap={false}>
          <Popover
            active={moreFiltersOpen}
            activator={
              <Button
                icon={FilterIcon}
                onClick={toggleMoreFilters}
                disclosure={moreFiltersOpen ? 'up' : 'down'}
                pressed={moreFiltersActive}
              >
                More filters
              </Button>
            }
            onClose={toggleMoreFilters}
            preferredAlignment="right"
          >
            <Box padding="400" minWidth="240px">
              <Select
                label="Commission"
                options={COMMISSION_FILTER_OPTIONS}
                value={commissionFilter}
                onChange={onCommissionFilterChange}
              />
            </Box>
          </Popover>
          <Button variant="plain" onClick={onClearFilters} disabled={!hasActiveFilters}>
            Clear filters
          </Button>
        </InlineStack>
      </InlineStack>
    </Box>
  );
}
