import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Banner,
  BlockStack,
  Box,
  Card,
  EmptyState,
  IndexTable,
  InlineStack,
  Modal,
  Page,
  Pagination,
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
  creatorHandle,
  formatCompactNumber,
  formatFollowupDate,
  formatLastContactLabel,
  getFollowupEmphasis,
} from '../constants';
import ImportCsvModal from '../components/ImportCsvModal';
import DashboardFilterBar from '../components/DashboardFilterBar';
import DashboardPageHeader from '../components/DashboardPageHeader';
import LevelBadge from '../components/dashboard/LevelBadge';
import ToolbarPopoverSelect from '../components/dashboard/ToolbarPopoverSelect';
import CreatorTableAvatar from '../components/dashboard/CreatorTableAvatar';
import StatusBadge from '../components/dashboard/StatusBadge';
import PlatformIndicators from '../components/PlatformIndicators';
import StatsCards from '../components/StatsCards';
import { useAutoDismiss } from '../hooks/useAutoDismiss';

function VerifiedTimestampCell({ timestamp }) {
  if (!timestamp) {
    return <span className="crm-table-muted">—</span>;
  }

  return <span className="crm-verified-primary">{formatLastContactLabel(timestamp)}</span>;
}

function LastContactCell({ timestamp }) {
  if (!timestamp) {
    return <span className="crm-table-muted">—</span>;
  }

  return <span className="crm-contact-primary">{formatLastContactLabel(timestamp)}</span>;
}

function FollowupCell({ record, followupEmphasis }) {
  if (!record.next_followup_at || !followupEmphasis) {
    return <span className="crm-table-muted">—</span>;
  }

  const dateLabel = formatFollowupDate(record.next_followup_at);

  if (followupEmphasis.tone === 'critical') {
    return (
      <BlockStack gap="050">
        <span className="crm-followup-overdue">{followupEmphasis.label}</span>
        <span className="crm-date-secondary crm-followup-overdue-date">{dateLabel}</span>
      </BlockStack>
    );
  }

  if (followupEmphasis.tone === 'success') {
    return (
      <BlockStack gap="050">
        <span className="crm-followup-positive">{followupEmphasis.label}</span>
        <span className="crm-date-secondary">{dateLabel}</span>
      </BlockStack>
    );
  }

  if (followupEmphasis.tone === 'warning') {
    return (
      <BlockStack gap="050">
        <span className="crm-followup-positive">{followupEmphasis.label}</span>
        <span className="crm-date-secondary">{dateLabel}</span>
      </BlockStack>
    );
  }

  return (
    <BlockStack gap="050">
      <span className="crm-contact-primary">{dateLabel}</span>
    </BlockStack>
  );
}

const SUCCESS_DISMISS_MS = 4000;
const resourceName = { singular: 'creator', plural: 'creators' };
const PAGE_SIZE_OPTIONS = [
  { label: '10 per page', value: '10' },
  { label: '20 per page', value: '20' },
  { label: '50 per page', value: '50' },
];

const SORTABLE_COLUMNS = [
  'name',
  'status',
  'ambassador_level',
  null,
  'total_followers',
  'followers_last_verified_at',
  'last_contacted_at',
  'next_followup_at',
];

export default function DashboardPage({ localPreview = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const hasLoadedRecordsRef = useRef(false);
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

  const totalPages = Math.max(1, Math.ceil(displayRecords.length / pageSize));

  const paginatedRecords = useMemo(() => {
    const start = (page - 1) * pageSize;
    return displayRecords.slice(start, start + pageSize);
  }, [displayRecords, page, pageSize]);

  const paginationLabel =
    displayRecords.length === 0
      ? 'Showing 0 creators'
      : `Showing ${(page - 1) * pageSize + 1} to ${Math.min(page * pageSize, displayRecords.length)} of ${displayRecords.length} creators`;
  const resultSummary = `${displayRecords.length.toLocaleString('en-US')} creator${displayRecords.length === 1 ? '' : 's'} found`;

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

  const selectedItemsCount = allResourcesSelected ? 'All' : selectedResources.length;

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

  const apiFilters = appliedFilters;

  const loadRecords = useCallback(async () => {
    const isInitialLoad = !hasLoadedRecordsRef.current;

    if (isInitialLoad) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError('');

    try {
      const data = await fetchSponsorshipRecords(apiFilters);
      setRecords(data);
      setRecordsFilters(apiFilters);
      hasLoadedRecordsRef.current = true;
    } catch (err) {
      setError(err.message || 'Failed to load creator records');
    } finally {
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
      setAppliedFilters((current) => ({
        ...current,
        search: search.trim(),
      }));
    }, 350);

    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setAppliedFilters((current) => ({
      ...current,
      status: statusFilter,
      ambassador_level: levelFilter,
      platform: platformFilter,
      commission: commissionFilter,
      due_followup: dueFollowupFilter,
    }));
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
      <IndexTable.Row
        id={String(record.id)}
        key={record.id}
        position={index}
        selected={selectedResources.includes(String(record.id))}
        onClick={() => navigate(`/creators/${record.id}`)}
      >
        <IndexTable.Cell className="crm-creator-table__creator-cell">
          <div className="crm-v2-creator-stack">
            <CreatorTableAvatar record={record} />
            <div className="crm-v2-creator-text">
              <span className="crm-v2-creator-name">{record.name}</span>
              <span className="crm-v2-creator-handle">{creatorHandle(record)}</span>
            </div>
          </div>
        </IndexTable.Cell>
        <IndexTable.Cell className="crm-v2-table__status-cell">
          <StatusBadge status={record.status} />
        </IndexTable.Cell>
        <IndexTable.Cell className="crm-v2-table__level-cell">
          <LevelBadge level={record.ambassador_level} />
        </IndexTable.Cell>
        <IndexTable.Cell className="crm-v2-table__platform-cell">
          <PlatformIndicators record={record} showEmpty size="table" />
        </IndexTable.Cell>
        <IndexTable.Cell className="crm-v2-table__followers-cell">
          <Text as="span" className="crm-v2-followers-value">
            {formatCompactNumber(record.total_followers)}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell className="crm-v2-table__verified-cell">
          <VerifiedTimestampCell timestamp={record.followers_last_verified_at} />
        </IndexTable.Cell>
        <IndexTable.Cell className="crm-v2-table__contact-cell">
          <LastContactCell timestamp={record.last_contacted_at} />
        </IndexTable.Cell>
        <IndexTable.Cell className="crm-v2-table__followup-cell">
          <FollowupCell record={record} followupEmphasis={followupEmphasis} />
        </IndexTable.Cell>
      </IndexTable.Row>
    );
  });

  return (
    <Page fullWidth className="crm-page crm-dashboard-v2">
      <Box className="crm-dashboard-v2__shell">
        <Box className="crm-dashboard-v2__container">
          <BlockStack gap="600">
          <DashboardPageHeader
            search={search}
            onSearchChange={setSearch}
            onExport={handleExport}
            exportDisabled={records.length === 0}
            onAddCreator={() => navigate('/creators/new')}
          />

          {success ? (
            <Banner tone="success" onDismiss={() => setSuccess('')}>
              <p>{success}</p>
            </Banner>
          ) : null}

          {error ? (
            <Banner tone="critical" title="Something went wrong">
              <p>{error}</p>
            </Banner>
          ) : null}

          <StatsCards stats={stats} loading={statsLoading} />

          <DashboardFilterBar
            search={search}
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
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
            resultSummary={resultSummary}
            resultsPending={loading || refreshing || !recordsMatchFilters}
            refreshing={refreshing}
          />

          <Card
            padding="0"
            className={`crm-v2-table${refreshing ? ' crm-v2-table--refreshing' : ''}`}
          >
            <IndexTable
              resourceName={resourceName}
              itemCount={displayRecords.length}
              headings={[
                { title: 'Creator' },
                { title: 'Status' },
                { title: 'Ambassador Level' },
                { title: 'Platforms' },
                { title: 'Followers' },
                { title: 'Last Verified' },
                { title: 'Last Contact' },
                { title: 'Next Follow-up' },
              ]}
              sortable={[true, true, true, false, true, true, true, true]}
              sortDirection={sortDirection}
              sortColumnIndex={sortColumnIndex}
              onSort={handleSort}
              loading={loading}
              selectable
              selectedItemsCount={selectedItemsCount}
              onSelectionChange={handleSelectionChange}
              promotedBulkActions={[
                {
                  content: 'Delete selected',
                  onAction: () => setBulkDeleteOpen(true),
                  destructive: true,
                },
              ]}
              emptyState={
                hasActiveFilters && !loading ? (
                  <EmptyState
                    heading="No creators match your filters"
                    image=""
                    action={{
                      content: 'Clear filters',
                      onAction: clearFilters,
                    }}
                  >
                    <p>Try adjusting or clearing your filters to see more creators.</p>
                  </EmptyState>
                ) : (
                  <EmptyState
                    heading="No creators yet"
                    image=""
                    action={{
                      content: 'Import CSV',
                      onAction: () => setImportModalOpen(true),
                    }}
                    secondaryAction={{
                      content: 'Add Creator',
                      onAction: () => navigate('/creators/new'),
                    }}
                  >
                    <p>Import the team spreadsheet or add the first creator manually.</p>
                  </EmptyState>
                )
              }
            >
              {rowMarkup}
            </IndexTable>
            {displayRecords.length > 0 ? (
              <Box className="crm-v2-table__footer">
                <InlineStack align="space-between" blockAlign="center" wrap gap="400">
                  <Text as="p" tone="subdued" variant="bodySm">
                    {paginationLabel}
                  </Text>
                  <Pagination
                    hasPrevious={page > 1}
                    onPrevious={() => setPage((current) => Math.max(1, current - 1))}
                    hasNext={page < totalPages}
                    onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
                  />
                  <Box className="crm-v2-table__page-size">
                    <ToolbarPopoverSelect
                      label="Per page"
                      labelHidden
                      compact
                      options={PAGE_SIZE_OPTIONS}
                      value={String(pageSize)}
                      onChange={(value) => {
                        setPageSize(Number(value));
                        setPage(1);
                      }}
                    />
                  </Box>
                </InlineStack>
              </Box>
            ) : null}
          </Card>
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
        title="Delete selected creators?"
        primaryAction={{
          content: 'Delete',
          onAction: handleBulkDeleteConfirm,
          loading: bulkDeleting,
          destructive: true,
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: () => setBulkDeleteOpen(false),
            disabled: bulkDeleting,
          },
        ]}
      >
        <Modal.Section>
          <Text as="p" variant="bodyMd">
            Delete {selectedItemsCount === 'All' ? 'all' : selectedItemsCount}{' '}
            {selectedItemsCount === 1 ? 'creator' : 'creators'}? This action cannot be undone.
          </Text>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
