import { useCallback, useEffect, useState } from 'react';
import {
  Badge,
  Banner,
  BlockStack,
  Box,
  Button,
  Card,
  EmptyState,
  IndexTable,
  InlineStack,
  Layout,
  Modal,
  Page,
  Select,
  Text,
  TextField,
  useIndexResourceState,
} from '@shopify/polaris';
import {
  deleteSponsorshipRecord,
  deleteSponsorshipRecords,
  exportSponsorshipCsv,
  fetchSponsorshipRecords,
  fetchSponsorshipStats,
} from './api';
import {
  COMMISSION_FILTER_OPTIONS,
  displayAmbassadorLevel,
  LEVEL_OPTIONS,
  levelTone,
  STATUS_FILTER_OPTIONS,
  statusTone,
} from './constants';
import AddCreatorModal from './components/AddCreatorModal';
import CreatorDetailModal from './components/CreatorDetailModal';
import ImportCsvModal from './components/ImportCsvModal';
import StatsCards from './components/StatsCards';
import { useAutoDismiss } from './hooks/useAutoDismiss';

const SUCCESS_DISMISS_MS = 4000;
const resourceName = { singular: 'creator', plural: 'creators' };

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
    <Page title="Influencer Dashboard">
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
  'channel',
  'affiliate_code',
  'commission',
  'total_followers',
];

function truncate(value, max = 48) {
  const text = String(value || '').trim();
  if (!text) return '—';
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function isFollowupDue(record) {
  if (!record.next_followup_at) return false;
  const due = new Date(record.next_followup_at);
  if (Number.isNaN(due.getTime())) return false;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + 7);
  return due <= cutoff;
}

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
  const [dueFollowupOnly, setDueFollowupOnly] = useState(false);
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
        due_followup: dueFollowupOnly,
      }));
    }, 350);

    return () => window.clearTimeout(timer);
  }, [search, statusFilter, levelFilter, commissionFilter, dueFollowupOnly, missingConfig]);

  const handleSort = (headingIndex, direction) => {
    setSortColumnIndex(headingIndex);
    setSortDirection(direction);
    setAppliedFilters((current) => ({
      ...current,
      sort_by: SORTABLE_COLUMNS[headingIndex],
      sort_dir: direction === 'ascending' ? 'asc' : 'desc',
    }));
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setLevelFilter('');
    setCommissionFilter('');
    setDueFollowupOnly(false);
  };

  const hasActiveFilters =
    search.trim() ||
    statusFilter ||
    levelFilter ||
    commissionFilter ||
    dueFollowupOnly;

  const refreshDashboard = () => {
    loadRecords();
    loadStats();
  };

  const handleExport = async () => {
    try {
      const csv = await exportSponsorshipCsv(appliedFilters);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Sponsorship Progress Tracking - Sheet1.csv';
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || 'Failed to export CSV');
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

  const rowMarkup = records.map((record, index) => (
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
      <IndexTable.Cell>
        <InlineStack gap="200" blockAlign="center">
          <Text as="span" variant="bodyMd" fontWeight="semibold">
            {record.name}
          </Text>
          {isFollowupDue(record) ? <Badge tone="warning">Due</Badge> : null}
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
        <Badge tone={levelTone(record.ambassador_level)}>
          {displayAmbassadorLevel(record.ambassador_level)}
        </Badge>
      </IndexTable.Cell>
      <IndexTable.Cell>{truncate(record.channel, 32)}</IndexTable.Cell>
      <IndexTable.Cell>{record.affiliate_code || '—'}</IndexTable.Cell>
      <IndexTable.Cell>{record.commission || '—'}</IndexTable.Cell>
      <IndexTable.Cell>
        {Number(record.total_followers || 0).toLocaleString('en-US')}
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Page
      title="Influencer Dashboard"
      primaryAction={{
        content: 'Add Creator',
        onAction: () => setAddModalOpen(true),
      }}
      secondaryActions={[
        {
          content: 'Import CSV',
          onAction: () => setImportModalOpen(true),
        },
        {
          content: 'Export CSV',
          onAction: handleExport,
          disabled: records.length === 0,
        },
      ]}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
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

            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center" wrap>
                  <Text as="h2" variant="headingMd">
                    Search & filters
                  </Text>
                  {hasActiveFilters ? (
                    <Button variant="plain" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  ) : null}
                </InlineStack>
                <InlineStack gap="300" wrap>
                  <Box minWidth="280px">
                    <TextField
                      label="Search"
                      value={search}
                      onChange={setSearch}
                      placeholder="Name, channel, product, affiliate code, email"
                      autoComplete="off"
                      clearButton
                      onClearButtonClick={() => setSearch('')}
                    />
                  </Box>
                  <Box minWidth="200px">
                    <Select
                      label="Status"
                      options={STATUS_FILTER_OPTIONS}
                      value={statusFilter}
                      onChange={setStatusFilter}
                    />
                  </Box>
                  <Box minWidth="200px">
                    <Select
                      label="Ambassador Level"
                      options={LEVEL_OPTIONS}
                      value={levelFilter}
                      onChange={setLevelFilter}
                    />
                  </Box>
                  <Box minWidth="180px">
                    <Select
                      label="Commission"
                      options={COMMISSION_FILTER_OPTIONS}
                      value={commissionFilter}
                      onChange={setCommissionFilter}
                    />
                  </Box>
                  <Box paddingBlockStart="600">
                    <Button
                      pressed={dueFollowupOnly}
                      onClick={() => setDueFollowupOnly((current) => !current)}
                    >
                      Due for follow-up
                    </Button>
                  </Box>
                </InlineStack>
              </BlockStack>
            </Card>

            <Card padding="0">
              <Box padding="300" paddingBlockEnd="0">
                <Text as="p" tone="subdued" variant="bodySm">
                  Click a row to view sponsorship details, monthly progress, and notes.
                </Text>
              </Box>
              <IndexTable
                resourceName={resourceName}
                itemCount={records.length}
                headings={[
                  { title: 'Name' },
                  { title: 'Status' },
                  { title: 'Ambassador Level' },
                  { title: 'Channel' },
                  { title: 'Affiliate Code' },
                  { title: 'Commission' },
                  { title: 'Total Followers' },
                ]}
                sortable={[true, true, true, true, true, true, true]}
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
