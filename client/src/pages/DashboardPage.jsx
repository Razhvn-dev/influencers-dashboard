import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Banner,
  BlockStack,
  Box,
  IndexTable,
  Modal,
  Page,
  Text,
  useIndexResourceState,
} from '@shopify/polaris';
import {
  deleteSponsorshipRecords,
  exportInfluencersXlsx,
  fetchSponsorshipRecords,
  fetchSponsorshipStats,
} from '../api';
import {
  getFollowupEmphasis,
} from '../constants';
import ImportCsvModal from '../components/ImportCsvModal';
import CreatorListContent from '../components/creator-list/CreatorListContent';
import CreatorListEmptyState from '../components/creator-list/CreatorListEmptyState';
import CreatorListHeader from '../components/creator-list/CreatorListHeader';
import CreatorListPagination from '../components/creator-list/CreatorListPagination';
import CreatorListResultsBar from '../components/creator-list/CreatorListResultsBar';
import CreatorListToolbar from '../components/creator-list/CreatorListToolbar';
import CreatorMobileCardList from '../components/creator-list/CreatorMobileCardList';
import CreatorResourceRow from '../components/creator-list/CreatorResourceRow';
import StatsCards from '../components/StatsCards';
import { useAutoDismiss } from '../hooks/useAutoDismiss';
import { useIndexTableColumnLayout } from '../hooks/useIndexTableColumnLayout.js';
import { useTranslation } from '../i18n/LanguageContext.jsx';

const SUCCESS_DISMISS_MS = 4000;

function filtersEqual(left, right) {
  return (
    left.search === right.search &&
    left.status === right.status &&
    left.ambassador_level === right.ambassador_level &&
    left.platform === right.platform &&
    left.commission === right.commission &&
    left.due_followup === right.due_followup &&
    left.sort_by === right.sort_by &&
    left.sort_dir === right.sort_dir
  );
}

const SORTABLE_COLUMNS = [
  'name',
  null,
  'total_followers',
  'status',
  'ambassador_level',
  null,
  'next_followup_at',
];

export default function DashboardPage({ localPreview = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const resourceName = useMemo(
    () => ({ singular: t('common.creator'), plural: t('common.creators') }),
    [t]
  );
  const pageSizeOptions = useMemo(
    () => [
      { label: t('dashboard.pageSize10'), value: '10' },
      { label: t('dashboard.pageSize20'), value: '20' },
      { label: t('dashboard.pageSize50'), value: '50' },
    ],
    [t]
  );
  const [records, setRecords] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const hasLoadedRecordsRef = useRef(false);
  const recordsRequestIdRef = useRef(0);
  const tableContainerRef = useRef(null);
  const [recordsError, setRecordsError] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [commissionFilter, setCommissionFilter] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [dueFollowupFilter, setDueFollowupFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortColumnIndex, setSortColumnIndex] = useState(null);
  const [sortDirection, setSortDirection] = useState('descending');
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    status: '',
    ambassador_level: '',
    platform: '',
    commission: '',
    due_followup: '',
    sort_by: 'id',
    sort_dir: 'desc',
  });
  const [recordsFilters, setRecordsFilters] = useState(appliedFilters);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const {
    selectedResources,
    allResourcesSelected,
    handleSelectionChange,
    clearSelection,
  } = useIndexResourceState(records, {
    resourceIDResolver: (record) => String(record.id),
  });

  const displayRecords = records;

  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const paginatedRecords = records;

  useIndexTableColumnLayout(tableContainerRef, !loading && displayRecords.length > 0);

  const paginationLabel =
    displayRecords.length === 0
      ? t('dashboard.showingZero')
      : t('dashboard.showing', {
          from: (page - 1) * pageSize + 1,
          to: Math.min(page * pageSize, totalRecords),
          total: totalRecords,
        });
  const resultSummary =
    totalRecords === 1
      ? t('dashboard.creatorsFound', { count: totalRecords })
      : t('dashboard.creatorsFoundPlural', { count: totalRecords });

  const currentFilterState = useMemo(
    () => ({
      search: search.trim(),
      status: statusFilter,
      ambassador_level: levelFilter,
      platform: platformFilter,
      commission: commissionFilter,
      due_followup: dueFollowupFilter,
    }),
    [search, statusFilter, levelFilter, platformFilter, commissionFilter, dueFollowupFilter]
  );

  const recordsMatchFilters =
    recordsFilters.search === currentFilterState.search &&
    recordsFilters.status === currentFilterState.status &&
    recordsFilters.ambassador_level === currentFilterState.ambassador_level &&
    recordsFilters.platform === currentFilterState.platform &&
    recordsFilters.commission === currentFilterState.commission &&
    recordsFilters.due_followup === currentFilterState.due_followup;

  const selectedItemsCount = allResourcesSelected ? records.length : selectedResources.length;

  const dismissSuccess = useCallback(() => setSuccess(''), []);
  useAutoDismiss(success, dismissSuccess, SUCCESS_DISMISS_MS);

  useEffect(() => {
    if (location.state?.success) {
      setSuccess(location.state.success);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);

    try {
      const data = await fetchSponsorshipStats();
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const apiFilters = useMemo(
    () => ({ ...appliedFilters, page, page_size: pageSize }),
    [appliedFilters, page, pageSize]
  );

  const loadRecords = useCallback(async () => {
    const requestId = recordsRequestIdRef.current += 1;
    const isInitialLoad = !hasLoadedRecordsRef.current;

    if (isInitialLoad) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setRecordsError('');

    try {
      const data = await fetchSponsorshipRecords(apiFilters);
      if (requestId !== recordsRequestIdRef.current) return;

      setRecords(data.records);
      setTotalRecords(data.pagination?.total ?? data.records.length);
      setRecordsFilters(apiFilters);
      setRecordsError('');
      hasLoadedRecordsRef.current = true;
    } catch (err) {
      if (requestId !== recordsRequestIdRef.current) return;

      setRecordsError(err.message || 'Failed to load creator records');
    } finally {
      if (requestId !== recordsRequestIdRef.current) return;

      setLoading(false);
      setRefreshing(false);
    }
  }, [apiFilters]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAppliedFilters((current) => {
        const next = {
          ...current,
          search: search.trim(),
        };
        return filtersEqual(current, next) ? current : next;
      });
    }, 350);

    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setAppliedFilters((current) => {
      const next = {
        ...current,
        status: statusFilter,
        ambassador_level: levelFilter,
        platform: platformFilter,
        commission: commissionFilter,
        due_followup: dueFollowupFilter,
      };
      return filtersEqual(current, next) ? current : next;
    });
  }, [statusFilter, levelFilter, platformFilter, commissionFilter, dueFollowupFilter]);

  useEffect(() => {
    setPage(1);
  }, [
    search,
    statusFilter,
    levelFilter,
    commissionFilter,
    platformFilter,
    dueFollowupFilter,
    appliedFilters.sort_by,
    appliedFilters.sort_dir,
  ]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleSort = (headingIndex, direction) => {
    const sortKey = SORTABLE_COLUMNS[headingIndex];
    if (!sortKey) return;

    setSortColumnIndex(headingIndex);
    setSortDirection(direction);

    if (sortKey === 'ambassador_level') {
      setAppliedFilters((current) => ({
        ...current,
        sort_by: sortKey,
        sort_dir: direction === 'ascending' ? 'asc' : 'desc',
      }));
      return;
    }

    setAppliedFilters((current) => ({
      ...current,
      sort_by: sortKey,
      sort_dir: direction === 'ascending' ? 'asc' : 'desc',
    }));
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setLevelFilter('');
    setCommissionFilter('');
    setPlatformFilter('');
    setDueFollowupFilter('');
  };

  const handleKpiClick = useCallback((filterKey, filterValue) => {
    if (filterKey !== 'due_followup') {
      return;
    }

    setDueFollowupFilter(filterValue);
    setPage(1);
    window.requestAnimationFrame(() => {
      tableContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  const hasActiveFilters =
    search.trim() ||
    statusFilter ||
    levelFilter ||
    commissionFilter ||
    platformFilter ||
    dueFollowupFilter;

  const refreshDashboard = () => {
    loadRecords();
    loadStats();
  };

  const handleExport = async () => {
    try {
      const blob = await exportInfluencersXlsx(appliedFilters);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'influencers.xlsx';
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || 'Failed to export Excel file');
    }
  };

  const handleImported = (result) => {
    setSuccess(result.message || 'CSV imported successfully');
    refreshDashboard();
  };

  const handleBulkDeleteConfirm = async () => {
    setBulkDeleting(true);
    setError('');

    try {
      const ids = allResourcesSelected
        ? records.map((record) => record.id)
        : selectedResources.map((id) => Number(id));

      if (ids.length === 0) {
        throw new Error('No creators selected');
      }

      const result = await deleteSponsorshipRecords(ids);

      clearSelection();
      setBulkDeleteOpen(false);
      setSuccess(result.message || `Deleted ${ids.length} creator(s) successfully.`);
      refreshDashboard();
    } catch (err) {
      setError(err.message || 'Failed to delete selected creators');
    } finally {
      setBulkDeleting(false);
    }
  };

  const rowMarkup = paginatedRecords.map((record, index) => {
    const followupEmphasis = getFollowupEmphasis(record.next_followup_at);

    return (
      <CreatorResourceRow
        key={record.id}
        position={index}
        record={record}
        selected={selectedResources.includes(String(record.id))}
        onNavigate={() => navigate(`/creators/${record.id}`)}
        followupEmphasis={followupEmphasis}
      />
    );
  });

  return (
    <Page fullWidth className="crm-page crm-dashboard-v2">
      <Box className="crm-dashboard-v2__shell crm-dashboard-v2">
        <Box className="crm-dashboard-v2__container">
          <BlockStack gap="500">
          <CreatorListHeader
            search={search}
            onSearchChange={setSearch}
            onExport={handleExport}
            exportDisabled={records.length === 0}
            onAddCreator={() => navigate('/creators/new')}
            onRefresh={refreshDashboard}
            refreshing={refreshing || loading || statsLoading}
          />

          {success ? (
            <Banner tone="success" onDismiss={() => setSuccess('')}>
              <p>{success}</p>
            </Banner>
          ) : null}

          {recordsError || error ? (
            <Banner tone="critical" title={t('dashboard.somethingWrong')}>
              <p>{recordsError || error}</p>
            </Banner>
          ) : null}

          <section className="crm-creator-list__overview" aria-label={t('creatorList.overview')}>
            <StatsCards stats={stats} loading={statsLoading} onKpiClick={handleKpiClick} />
          </section>

          <CreatorListToolbar
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            levelFilter={levelFilter}
            onLevelFilterChange={setLevelFilter}
            platformFilter={platformFilter}
            onPlatformFilterChange={setPlatformFilter}
            dueFollowupFilter={dueFollowupFilter}
            onDueFollowupFilterChange={setDueFollowupFilter}
            commissionFilter={commissionFilter}
            onCommissionFilterChange={setCommissionFilter}
          />

          <CreatorListContent itemCount={displayRecords.length}>
            <Box
              ref={tableContainerRef}
              className={`crm-v2-table${refreshing ? ' crm-v2-table--refreshing' : ''}`}
            >
            <CreatorListResultsBar
              resultSummary={resultSummary}
              resultsPending={loading || refreshing}
              refreshing={refreshing}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearFilters}
              search={search}
              statusFilter={statusFilter}
              levelFilter={levelFilter}
              platformFilter={platformFilter}
              dueFollowupFilter={dueFollowupFilter}
              commissionFilter={commissionFilter}
            />
            <IndexTable
              resourceName={resourceName}
              itemCount={displayRecords.length}
              headings={[
                { title: t('dashboard.columns.creator') },
                { title: t('dashboard.columns.platforms') },
                { title: t('dashboard.columns.followers') },
                { title: t('dashboard.columns.status') },
                { title: t('dashboard.columns.level') },
                { title: t('dashboard.columns.activity') },
                { title: t('dashboard.columns.nextFollowup') },
              ]}
              sortable={[true, false, true, true, true, false, true]}
              sortDirection={sortDirection}
              sortColumnIndex={sortColumnIndex}
              onSort={handleSort}
              loading={loading}
              selectable
              selectedItemsCount={selectedItemsCount}
              onSelectionChange={handleSelectionChange}
              promotedBulkActions={[
                {
                  content: t('dashboard.deleteSelected'),
                  onAction: () => setBulkDeleteOpen(true),
                  destructive: true,
                },
              ]}
              emptyState={
                <CreatorListEmptyState
                  hasActiveFilters={hasActiveFilters && !loading}
                  onClearFilters={clearFilters}
                  onAddCreator={() => navigate('/creators/new')}
                  onImport={() => setImportModalOpen(true)}
                />
              }
            >
              {rowMarkup}
            </IndexTable>
            {displayRecords.length > 0 ? (
              <CreatorListPagination
                className="crm-creator-list__pagination--desktop"
                paginationLabel={paginationLabel}
                page={page}
                totalPages={totalPages}
                onPrevious={() => setPage((current) => Math.max(1, current - 1))}
                onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
                pageSize={pageSize}
                pageSizeOptions={pageSizeOptions}
                onPageSizeChange={(value) => {
                  setPageSize(Number(value));
                  setPage(1);
                }}
                perPageLabel={t('dashboard.perPage')}
              />
            ) : null}
            </Box>
            <div className="crm-creator-list__mobile-content">
              {displayRecords.length > 0 ? (
                <>
                  <CreatorMobileCardList
                    records={paginatedRecords}
                    onNavigate={(record) => navigate(`/creators/${record.id}`)}
                  />
                  <CreatorListPagination
                    className="crm-creator-list__pagination--mobile"
                    paginationLabel={paginationLabel}
                    page={page}
                    totalPages={totalPages}
                    onPrevious={() => setPage((current) => Math.max(1, current - 1))}
                    onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
                    pageSize={pageSize}
                    pageSizeOptions={pageSizeOptions}
                    onPageSizeChange={(value) => {
                      setPageSize(Number(value));
                      setPage(1);
                    }}
                    perPageLabel={t('dashboard.perPage')}
                  />
                </>
              ) : !loading ? (
                <CreatorListEmptyState
                  hasActiveFilters={hasActiveFilters}
                  onClearFilters={clearFilters}
                  onAddCreator={() => navigate('/creators/new')}
                  onImport={() => setImportModalOpen(true)}
                />
              ) : null}
            </div>
          </CreatorListContent>
          </BlockStack>
        </Box>
      </Box>

      <ImportCsvModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImported={handleImported}
      />

      <Modal
        open={bulkDeleteOpen}
        onClose={() => {
          if (!bulkDeleting) {
            setBulkDeleteOpen(false);
          }
        }}
        title={t('dashboard.deleteSelectedTitle')}
        primaryAction={{
          content: t('common.delete'),
          onAction: handleBulkDeleteConfirm,
          loading: bulkDeleting,
          destructive: true,
        }}
        secondaryActions={[
          {
            content: t('common.cancel'),
            onAction: () => setBulkDeleteOpen(false),
            disabled: bulkDeleting,
          },
        ]}
      >
        <Modal.Section>
          <Text as="p" variant="bodyMd">
            {t('dashboard.deleteConfirm', {
              count: selectedItemsCount,
              unit:
                selectedItemsCount === 1
                  ? t('common.creator')
                  : t('common.creators'),
            })}
          </Text>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
