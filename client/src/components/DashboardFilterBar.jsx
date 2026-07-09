import { useMemo } from 'react';
import { Box, InlineStack } from '@shopify/polaris';
import {
  COMMISSION_FILTER_OPTIONS,
  DUE_FOLLOWUP_FILTER_OPTIONS,
  LEVEL_OPTIONS,
  PLATFORM_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
} from '../constants';
import ToolbarPopoverSelect from './dashboard/ToolbarPopoverSelect';

function findLabel(options, value) {
  return options.find((option) => option.value === value)?.label || value;
}

function buildActiveFilterTags({
  search,
  statusFilter,
  levelFilter,
  platformFilter,
  dueFollowupFilter,
  commissionFilter,
}) {
  const tags = [];

  if (search.trim()) {
    tags.push({ id: 'search', label: `Search: ${search.trim()}` });
  }
  if (statusFilter) {
    tags.push({ id: 'status', label: findLabel(STATUS_FILTER_OPTIONS, statusFilter) });
  }
  if (levelFilter) {
    tags.push({ id: 'level', label: findLabel(LEVEL_OPTIONS, levelFilter) });
  }
  if (platformFilter) {
    tags.push({ id: 'platform', label: findLabel(PLATFORM_FILTER_OPTIONS, platformFilter) });
  }
  if (dueFollowupFilter) {
    tags.push({ id: 'followup', label: findLabel(DUE_FOLLOWUP_FILTER_OPTIONS, dueFollowupFilter) });
  }
  if (commissionFilter) {
    tags.push({ id: 'commission', label: findLabel(COMMISSION_FILTER_OPTIONS, commissionFilter) });
  }

  return tags;
}

export default function DashboardFilterBar({
  search,
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
  resultSummary = '0 creators found',
  resultsPending = false,
  refreshing = false,
}) {
  const activeTags = useMemo(
    () =>
      buildActiveFilterTags({
        search,
        statusFilter,
        levelFilter,
        platformFilter,
        dueFollowupFilter,
        commissionFilter,
      }),
    [search, statusFilter, levelFilter, platformFilter, dueFollowupFilter, commissionFilter]
  );

  return (
    <Box className="crm-v2-toolbar">
      <InlineStack gap="400" blockAlign="end" wrap={false}>
        <ToolbarPopoverSelect
          label="Status"
          options={STATUS_FILTER_OPTIONS}
          value={statusFilter}
          onChange={onStatusFilterChange}
        />
        <ToolbarPopoverSelect
          label="Ambassador Level"
          options={LEVEL_OPTIONS}
          value={levelFilter}
          onChange={onLevelFilterChange}
          className="crm-v2-toolbar__field--level"
        />
        <ToolbarPopoverSelect
          label="Platform"
          options={PLATFORM_FILTER_OPTIONS}
          value={platformFilter}
          onChange={onPlatformFilterChange}
        />
        <ToolbarPopoverSelect
          label="Next Follow-up"
          options={DUE_FOLLOWUP_FILTER_OPTIONS}
          value={dueFollowupFilter}
          onChange={onDueFollowupFilterChange}
        />
        <ToolbarPopoverSelect
          label="Commission"
          options={COMMISSION_FILTER_OPTIONS}
          value={commissionFilter}
          onChange={onCommissionFilterChange}
        />

        <Box className="crm-v2-toolbar__actions">
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

      <Box className="crm-v2-toolbar__results">
        <span className="crm-v2-toolbar__result-count">
          {resultsPending ? 'Updating results...' : resultSummary}
        </span>
        {activeTags.length > 0 ? (
          <span className="crm-v2-toolbar__result-filters">
            · {activeTags.length} filter{activeTags.length === 1 ? '' : 's'} applied
          </span>
        ) : null}
        {refreshing ? (
          <span className="crm-v2-toolbar__result-refreshing">Refreshing...</span>
        ) : null}
      </Box>

      {activeTags.length > 0 ? (
        <Box className="crm-v2-toolbar__active-filters">
          <InlineStack gap="200" wrap>
            {activeTags.map((tag) => (
              <span key={tag.id} className="crm-v2-toolbar__filter-tag">
                {tag.label}
              </span>
            ))}
          </InlineStack>
        </Box>
      ) : null}
    </Box>
  );
}
