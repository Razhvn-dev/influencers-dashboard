import { InlineStack } from '@shopify/polaris';
import { useMemo } from 'react';
import { useTranslation } from '../../i18n/LanguageContext.jsx';
import { buildActiveFilterTags, getFilterOptionSets } from '../../utils/buildActiveFilterTags.js';

export default function CreatorListResultsBar({
  resultSummary,
  resultsPending = false,
  refreshing = false,
  hasActiveFilters,
  onClearFilters,
  search,
  statusFilter,
  levelFilter,
  platformFilter,
  dueFollowupFilter,
  commissionFilter,
}) {
  const { t } = useTranslation();

  const activeTags = useMemo(() => {
    const optionSets = getFilterOptionSets(t);
    return buildActiveFilterTags({
      search,
      statusFilter,
      levelFilter,
      platformFilter,
      dueFollowupFilter,
      commissionFilter,
      t,
      ...optionSets,
    });
  }, [
    search,
    statusFilter,
    levelFilter,
    platformFilter,
    dueFollowupFilter,
    commissionFilter,
    t,
  ]);

  return (
    <div className="crm-v2-table-results-bar" role="status" aria-live="polite">
      <InlineStack gap="300" blockAlign="center" wrap>
        <span className="crm-v2-table-results-bar__count">
          {resultsPending ? t('dashboard.updatingResults') : resultSummary}
        </span>
        {refreshing ? (
          <span className="crm-v2-table-results-bar__refreshing">{t('dashboard.refreshing')}</span>
        ) : null}
        {activeTags.length > 0 ? (
          <InlineStack gap="200" wrap>
            {activeTags.map((tag) => (
              <span key={tag.id} className="crm-v2-table-results-bar__tag">
                {tag.label}
              </span>
            ))}
          </InlineStack>
        ) : null}
      </InlineStack>
      {hasActiveFilters ? (
        <button type="button" className="crm-v2-table-results-bar__clear" onClick={onClearFilters}>
          {t('filters.clearFilters')}
        </button>
      ) : null}
    </div>
  );
}
