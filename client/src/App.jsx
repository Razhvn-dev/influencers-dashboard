import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Banner,
  BlockStack,
  Box,
  Card,
  EmptyState,
  Icon,
  IndexTable,
  InlineStack,
  Layout,
  Modal,
  Page,
  Pagination,
  Select,
  Text,
  Avatar,
  useIndexResourceState,
} from '@shopify/polaris';
import { PersonIcon } from '@shopify/polaris-icons';
import {
  deleteSponsorshipRecord,
  deleteSponsorshipRecords,
  exportInfluencersXlsx,
  fetchSponsorshipRecords,
  fetchSponsorshipStats,
} from './api';
import {
  creatorHandle,
  creatorTagline,
  displayAmbassadorLevel,
  formatCompactNumber,
  formatFollowupDate,
  formatLastContactLabel,
  formatRelativeTime,
  getCreatorInitials,
  getFollowupEmphasis,
  normalizeExternalUrl,
  statusTone,
} from './constants';
import AddCreatorModal from './components/AddCreatorModal';
import CreatorDetailModal from './components/CreatorDetailModal';
import DashboardFilterBar from './components/DashboardFilterBar';
import DashboardPageHeader from './components/DashboardPageHeader';
import ImportCsvModal from './components/ImportCsvModal';
import PlatformIndicators from './components/PlatformIndicators';
import StatsCards from './components/StatsCards';
import { useAutoDismiss } from './hooks/useAutoDismiss';

const SUCCESS_DISMISS_MS = 4000;
const resourceName = { singular: 'creator', plural: 'creators' };
const PAGE_SIZE_OPTIONS = [
  { label: '10 per page', value: '10' },
  { label: '20 per page', value: '20' },
  { label: '50 per page', value: '50' },
];

function followupEmphasisClassName(emphasis) {
  if (!emphasis?.tone) return undefined;
  if (emphasis.tone === 'critical') return 'crm-followup-overdue';
  if (emphasis.tone === 'success') return 'crm-followup-positive';
  if (emphasis.tone === 'warning') return 'crm-followup-soon';
  return undefined;
}

function MissingConfigPage({ missingConfig }) {
  const title =
    missingConfig === 'apiKey'
      ? 'Shopify API key is missing'
      : 'Open this app from Shopify Admin';

  const message =
    missingConfig === 'apiKey'
      ? 'Set SHOPIFY_API_KEY in your deployment environment and rebuild the frontend.'
      : 'Install the app on your Shopify store, then open it from Apps in the Shopify admin.';

  return (
    <Page title="Influencer Dashboard" fullWidth className="crm-page">
      <Layout>
        <Layout.Section>
          <Banner tone="warning" title={title}>
            <p>{message}</p>
          </Banner>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

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

export default function App({ missingConfig = null, localPreview = false }) {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
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
    commission: '',
    due_followup: false,
    sort_by: 'id',
    sort_dir: 'desc',
  });
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
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

  const displayRecords = useMemo(() => {
    if (!platformFilter) return records;

    return records.filter((record) => normalizeExternalUrl(record?.[platformFilter]));
  }, [records, platformFilter]);

  const totalPages = Math.max(1, Math.ceil(displayRecords.length / pageSize));

  const paginatedRecords = useMemo(() => {
    const start = (page - 1) * pageSize;
    return displayRecords.slice(start, start + pageSize);
  }, [displayRecords, page, pageSize]);

  const paginationLabel =
    displayRecords.length === 0
      ? 'Showing 0 creators'
      : `Showing ${(page - 1) * pageSize + 1} to ${Math.min(page * pageSize, displayRecords.length)} of ${displayRecords.length} creators`;

  const selectedItemsCount = allResourcesSelected ? 'All' : selectedResources.length;

  const dismissSuccess = useCallback(() => setSuccess(''), []);
  useAutoDismiss(success, dismissSuccess, SUCCESS_DISMISS_MS);

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

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await fetchSponsorshipRecords(appliedFilters);
      setRecords(data);
    } catch (err) {
      setError(err.message || 'Failed to load creator records');
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    if (missingConfig) return;
    loadStats();
  }, [loadStats, missingConfig]);

  useEffect(() => {
    if (missingConfig) return;
    loadRecords();
  }, [loadRecords, missingConfig]);

  useEffect(() => {
    if (missingConfig) return;

    const timer = window.setTimeout(() => {
      setAppliedFilters((current) => ({
        ...current,
        search: search.trim(),
        status: statusFilter,
        ambassador_level: levelFilter,
        commission: commissionFilter,
        due_followup: dueFollowupFilter === 'due',
      }));
    }, 350);

    return () => window.clearTimeout(timer);
  }, [search, statusFilter, levelFilter, commissionFilter, dueFollowupFilter, missingConfig]);

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

  const handleRecordAdded = () => {
    setAddModalOpen(false);
    setSuccess('Creator record created successfully.');
    refreshDashboard();
  };

  const handleRecordUpdated = (updated) => {
    setRecords((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    setDetailOpen(false);
    setSelectedRecord(null);
    setSuccess('Creator record updated successfully.');
    loadStats();
  };

  const handleRecordDeleted = async (id) => {
    await deleteSponsorshipRecord(id);
    setDetailOpen(false);
    setSelectedRecord(null);
    setSuccess('Creator record deleted successfully.');
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

      if (selectedRecord && ids.includes(selectedRecord.id)) {
        setDetailOpen(false);
        setSelectedRecord(null);
      }

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

  if (missingConfig) {
    return <MissingConfigPage missingConfig={missingConfig} />;
  }

  const rowMarkup = paginatedRecords.map((record, index) => {
    const followupEmphasis = getFollowupEmphasis(record.next_followup_at);

    return (
      <IndexTable.Row
        id={String(record.id)}
        key={record.id}
        position={index}
        selected={selectedResources.includes(String(record.id))}
        onClick={() => {
          setSelectedRecord(record);
          setDetailOpen(true);
        }}
      >
        <IndexTable.Cell className="crm-creator-table__creator-cell">
          <InlineStack gap="400" blockAlign="center" wrap={false}>
            <Avatar
              customer
              size="lg"
              name={record.name}
              initials={getCreatorInitials(record.name)}
            />
            <BlockStack gap="050">
              <Text as="span" variant="bodyMd" fontWeight="semibold">
                {record.name}
              </Text>
              <Text as="span" variant="bodySm" tone="subdued">
                {creatorHandle(record)}
              </Text>
              <Text as="span" variant="bodySm" tone="subdued">
                {creatorTagline(record)}
              </Text>
            </BlockStack>
          </InlineStack>
        </IndexTable.Cell>
        <IndexTable.Cell>
          {record.status ? (
            <Badge tone={statusTone(record.status)}>{record.status}</Badge>
          ) : (
            '—'
          )}
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text as="span" variant="bodySm" className="crm-level-text">
            {displayAmbassadorLevel(record.ambassador_level)}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <PlatformIndicators record={record} showEmpty size="large" />
        </IndexTable.Cell>
        <IndexTable.Cell className="crm-creator-table__followers-cell">
          <Text as="span" variant="bodyMd" fontWeight="semibold">
            {formatCompactNumber(record.total_followers)}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          {record.followers_last_verified_at ? (
            <BlockStack gap="050">
              <Text as="span" variant="bodySm" fontWeight="semibold">
                {formatRelativeTime(record.followers_last_verified_at)}
              </Text>
              {record.followers_verified_by ? (
                <Text as="span" variant="bodySm" tone="subdued">
                  by {record.followers_verified_by}
                </Text>
              ) : null}
            </BlockStack>
          ) : (
            <Text as="span" tone="subdued" variant="bodySm">
              —
            </Text>
          )}
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text as="span" variant="bodySm">
            {formatLastContactLabel(record.last_contacted_at)}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          {record.next_followup_at && followupEmphasis ? (
            followupEmphasis.tone ? (
              <BlockStack gap="050">
                <Text
                  as="span"
                  variant="bodySm"
                  fontWeight="semibold"
                  className={followupEmphasisClassName(followupEmphasis)}
                >
                  {followupEmphasis.label}
                </Text>
                <Text as="span" variant="bodySm" tone="subdued">
                  {formatFollowupDate(record.next_followup_at)}
                </Text>
              </BlockStack>
            ) : (
              <Text as="span" variant="bodySm">
                {followupEmphasis.label}
              </Text>
            )
          ) : (
            <Text as="span" tone="subdued" variant="bodySm">
              —
            </Text>
          )}
        </IndexTable.Cell>
      </IndexTable.Row>
    );
  });

  return (
    <Page fullWidth className="crm-page">
      <Layout>
        <Layout.Section>
          <BlockStack gap="800">
            <DashboardPageHeader
              search={search}
              onSearchChange={setSearch}
              onExport={handleExport}
              exportDisabled={records.length === 0}
              onImport={() => setImportModalOpen(true)}
              onAddCreator={() => setAddModalOpen(true)}
            />

            {localPreview ? (
              <Banner tone="info" title="Local preview mode">
                <p>
                  Previewing outside Shopify Admin. Data comes from LOCAL_DEV_SHOP.
                </p>
              </Banner>
            ) : null}

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
            />

            <Card padding="0" className="crm-creator-table">
              <Box className="crm-creator-table__section-header">
                <InlineStack gap="200" blockAlign="center">
                  <Icon source={PersonIcon} tone="base" />
                  <Text as="h2" variant="headingMd" fontWeight="semibold">
                    Creator Table
                  </Text>
                </InlineStack>
              </Box>
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
                  <EmptyState
                    heading="No creators yet"
                    image=""
                    action={{
                      content: 'Import CSV',
                      onAction: () => setImportModalOpen(true),
                    }}
                    secondaryAction={{
                      content: 'Add Creator',
                      onAction: () => setAddModalOpen(true),
                    }}
                  >
                    <p>
                      Import the team spreadsheet or add the first creator manually.
                    </p>
                  </EmptyState>
                }
              >
                {rowMarkup}
              </IndexTable>
              {displayRecords.length > 0 ? (
                <Box className="crm-creator-table__footer">
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
                    <Box minWidth="140px">
                      <Select
                        label="Per page"
                        labelHidden
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
        </Layout.Section>
      </Layout>

      <AddCreatorModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onCreated={handleRecordAdded}
      />

      <ImportCsvModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImported={handleImported}
      />

      <CreatorDetailModal
        key={selectedRecord?.id ?? 'closed'}
        open={detailOpen}
        influencer={selectedRecord}
        onClose={() => {
          setDetailOpen(false);
          setSelectedRecord(null);
        }}
        onUpdated={handleRecordUpdated}
        onDeleted={handleRecordDeleted}
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
