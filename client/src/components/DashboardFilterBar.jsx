import { useMemo, useState } from 'react';
import { Box, Button, Icon, InlineStack, Popover, Select, Text, TextField } from '@shopify/polaris';
import { FilterIcon, SearchIcon } from '@shopify/polaris-icons';
import { useTranslation } from '../i18n/LanguageContext.jsx';
import { getFilterOptionSets } from '../utils/buildActiveFilterTags.js';
import ToolbarPopoverSelect from './dashboard/ToolbarPopoverSelect';

export default function DashboardFilterBar({
  search,
  onSearchChange,
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
}) {
  const { t } = useTranslation();
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);

  const { statusOptions, levelOptions, platformOptions, followupOptions, commissionOptions } = useMemo(
    () => getFilterOptionSets(t),
    [t]
  );

  return (
    <Box className="crm-v2-toolbar" role="region" aria-label={t('filters.title')}>
      <div className="crm-v2-toolbar__heading">
        <h2>{t('filters.title')}</h2>
      </div>

      <InlineStack gap="300" blockAlign="end" wrap className="crm-v2-toolbar__primary-filters">
        <Box className="crm-v2-toolbar__search-field">
          <TextField
            label={t('dashboard.searchPlaceholder')}
            labelHidden
            value={search}
            onChange={onSearchChange}
            placeholder={t('dashboard.searchPlaceholder')}
            autoComplete="off"
            prefix={<Icon source={SearchIcon} tone="subdued" />}
            clearButton
            onClearButtonClick={() => onSearchChange('')}
          />
        </Box>
        <ToolbarPopoverSelect
          label={t('filters.status')}
          labelHidden
          options={statusOptions}
          value={statusFilter}
          onChange={onStatusFilterChange}
        />
        <ToolbarPopoverSelect
          label={t('filters.level')}
          labelHidden
          options={levelOptions}
          value={levelFilter}
          onChange={onLevelFilterChange}
          className="crm-v2-toolbar__field--level"
        />
        <ToolbarPopoverSelect
          label={t('filters.platform')}
          labelHidden
          options={platformOptions}
          value={platformFilter}
          onChange={onPlatformFilterChange}
        />
        <Popover
          active={moreFiltersOpen}
          onClose={() => setMoreFiltersOpen(false)}
          activator={
            <Button
              icon={FilterIcon}
              onClick={() => setMoreFiltersOpen((open) => !open)}
              ariaExpanded={moreFiltersOpen}
              className="crm-v2-toolbar__more-filters"
            >
              {t('filters.moreFilters')}
            </Button>
          }
        >
          <Box padding="400" minWidth="240px">
            <Text as="p" variant="headingSm" fontWeight="semibold">
              {t('filters.moreFilters')}
            </Text>
            <Box paddingBlockStart="300">
              <Select
                label={t('filters.nextFollowup')}
                options={followupOptions}
                value={dueFollowupFilter}
                onChange={onDueFollowupFilterChange}
              />
            </Box>
            <Box paddingBlockStart="300">
              <Select
                label={t('filters.commission')}
                options={commissionOptions}
                value={commissionFilter}
                onChange={onCommissionFilterChange}
              />
            </Box>
          </Box>
        </Popover>
      </InlineStack>
    </Box>
  );
}
