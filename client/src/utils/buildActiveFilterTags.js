import {
  COMMISSION_FILTER_OPTIONS,
  DUE_FOLLOWUP_FILTER_OPTIONS,
  getPlatformMeta,
  LEVEL_OPTIONS,
  PLATFORM_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
} from '../constants';

function translateFilterOptions(options, t, { allKey, valuePrefix }) {
  return options.map((option) => {
    if (!option.value) {
      return { ...option, label: t(allKey) };
    }

    if (valuePrefix === 'filters') {
      if (option.value === 'due') {
        return { ...option, label: t('filters.dueIn7Days') };
      }
      if (option.value === 'overdue') {
        return { ...option, label: t('filters.overdue') };
      }
    }

    if (valuePrefix === 'platform') {
      const meta = getPlatformMeta(option.value);
      if (meta) {
        const key = `platform.${meta.label}`;
        const translated = t(key);
        return { ...option, label: translated === key ? meta.label : translated };
      }
      return option;
    }

    const key = `${valuePrefix}.${option.value}`;
    const translated = t(key);
    return { ...option, label: translated === key ? option.label : translated };
  });
}

export function getFilterOptionSets(t) {
  return {
    statusOptions: translateFilterOptions(STATUS_FILTER_OPTIONS, t, {
      allKey: 'filters.allStatuses',
      valuePrefix: 'status',
    }),
    levelOptions: translateFilterOptions(LEVEL_OPTIONS, t, {
      allKey: 'filters.allLevels',
      valuePrefix: 'level',
    }),
    platformOptions: translateFilterOptions(PLATFORM_FILTER_OPTIONS, t, {
      allKey: 'filters.allPlatforms',
      valuePrefix: 'platform',
    }),
    followupOptions: translateFilterOptions(DUE_FOLLOWUP_FILTER_OPTIONS, t, {
      allKey: 'filters.allFollowups',
      valuePrefix: 'filters',
    }),
    commissionOptions: COMMISSION_FILTER_OPTIONS.map((option) =>
      option.value ? option : { ...option, label: t('filters.allCommission') }
    ),
  };
}

export function buildActiveFilterTags({
  search,
  statusFilter,
  levelFilter,
  platformFilter,
  dueFollowupFilter,
  commissionFilter,
  t,
  statusOptions,
  levelOptions,
  platformOptions,
  followupOptions,
  commissionOptions,
}) {
  const tags = [];

  const findLabel = (options, value) =>
    options.find((option) => option.value === value)?.label || value;

  if (search.trim()) {
    tags.push({ id: 'search', label: t('filters.searchTag', { query: search.trim() }) });
  }
  if (statusFilter) {
    tags.push({ id: 'status', label: findLabel(statusOptions, statusFilter) });
  }
  if (levelFilter) {
    tags.push({ id: 'level', label: findLabel(levelOptions, levelFilter) });
  }
  if (platformFilter) {
    tags.push({ id: 'platform', label: findLabel(platformOptions, platformFilter) });
  }
  if (dueFollowupFilter) {
    tags.push({ id: 'followup', label: findLabel(followupOptions, dueFollowupFilter) });
  }
  if (commissionFilter) {
    tags.push({ id: 'commission', label: findLabel(commissionOptions, commissionFilter) });
  }

  return tags;
}
