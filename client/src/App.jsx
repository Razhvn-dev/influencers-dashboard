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
  Page,
  Select,
  Text,
  TextField,
} from '@shopify/polaris';
import { fetchInfluencers } from './api';
import AddCreatorModal from './components/AddCreatorModal';
import CreatorDetailModal from './components/CreatorDetailModal';

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

const STATUS_OPTIONS = [
  { label: 'All statuses', value: '' },
  { label: 'Contacted', value: 'Contacted' },
  { label: 'Approved', value: 'Approved' },
  { label: 'Partnered', value: 'Partnered' },
];

const LEVEL_OPTIONS = [
  { label: 'All levels', value: '' },
  { label: 'Level 1', value: 'Level 1' },
  { label: 'Level 2', value: 'Level 2' },
  { label: 'Level 3', value: 'Level 3' },
];

function statusTone(status) {
  if (status === 'Partnered') return 'success';
  if (status === 'Approved') return 'info';
  return 'attention';
}

function levelTone(level) {
  if (level === 'Level 3') return 'success';
  if (level === 'Level 2') return 'info';
  return undefined;
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString('en-US');
}

export default function App({ embedded = true, missingConfig = null }) {
  const [influencers, setInfluencers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({
    status: '',
    ambassador_level: '',
    region: '',
    search: '',
  });
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadInfluencers = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await fetchInfluencers(appliedFilters);
      setInfluencers(data);
    } catch (err) {
      setError(err.message || 'Failed to load influencers');
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    loadInfluencers();
  }, [loadInfluencers]);

  const applyFilters = () => {
    setAppliedFilters({
      status: statusFilter,
      ambassador_level: levelFilter,
      region: regionFilter.trim(),
      search: search.trim(),
    });
  };

  const handleRowClick = (influencer) => {
    setSelectedInfluencer(influencer);
    setDetailOpen(true);
  };

  const handleCreatorAdded = () => {
    setAddModalOpen(false);
    loadInfluencers();
  };

  const handleCreatorUpdated = (updated) => {
    setInfluencers((current) =>
      current.map((item) => (item.id === updated.id ? updated : item))
    );
    setSelectedInfluencer(updated);
  };

  if (missingConfig) {
    return <MissingConfigPage missingConfig={missingConfig} />;
  }

  const rowMarkup = influencers.map((influencer, index) => (
    <IndexTable.Row
      id={String(influencer.id)}
      key={influencer.id}
      position={index}
      onClick={() => handleRowClick(influencer)}
    >
      <IndexTable.Cell>
        <Text as="span" variant="bodyMd" fontWeight="semibold">
          {influencer.name}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>{influencer.company_name || '—'}</IndexTable.Cell>
      <IndexTable.Cell>{influencer.region || '—'}</IndexTable.Cell>
      <IndexTable.Cell>{formatNumber(influencer.total_followers)}</IndexTable.Cell>
      <IndexTable.Cell>
        <Badge tone={levelTone(influencer.ambassador_level)}>
          {influencer.ambassador_level || 'Level 1'}
        </Badge>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Badge tone={statusTone(influencer.status)}>{influencer.status}</Badge>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Page
      title="Influencer Dashboard"
      subtitle="Manage creator partnerships, outreach, and ambassador tiers"
      primaryAction={{
        content: 'Add Creator',
        onAction: () => setAddModalOpen(true),
      }}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            {error ? (
              <Banner tone="critical" title="Unable to load influencers">
                <p>{error}</p>
              </Banner>
            ) : null}

            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Filters
                </Text>
                <InlineStack gap="300" wrap>
                  <Box minWidth="220px">
                    <Select
                      label="Status"
                      options={STATUS_OPTIONS}
                      value={statusFilter}
                      onChange={setStatusFilter}
                    />
                  </Box>
                  <Box minWidth="220px">
                    <Select
                      label="Ambassador Level"
                      options={LEVEL_OPTIONS}
                      value={levelFilter}
                      onChange={setLevelFilter}
                    />
                  </Box>
                  <Box minWidth="220px">
                    <TextField
                      label="Region"
                      value={regionFilter}
                      onChange={setRegionFilter}
                      placeholder="e.g. US"
                      autoComplete="off"
                    />
                  </Box>
                  <Box minWidth="280px">
                    <TextField
                      label="Search"
                      value={search}
                      onChange={setSearch}
                      placeholder="Search by name or company"
                      autoComplete="off"
                      clearButton
                      onClearButtonClick={() => setSearch('')}
                    />
                  </Box>
                  <Box paddingBlockStart="600">
                    <Button onClick={applyFilters}>Apply Filters</Button>
                  </Box>
                </InlineStack>
              </BlockStack>
            </Card>

            <Card padding="0">
              <IndexTable
                resourceName={{ singular: 'creator', plural: 'creators' }}
                itemCount={influencers.length}
                headings={[
                  { title: 'Name' },
                  { title: 'Company/Channel' },
                  { title: 'Region' },
                  { title: 'Total Followers' },
                  { title: 'Ambassador Level' },
                  { title: 'Status' },
                ]}
                loading={loading}
                selectable={false}
                emptyState={
                  <EmptyState
                    heading="No creators found"
                    image=""
                    action={{
                      content: 'Add Creator',
                      onAction: () => setAddModalOpen(true),
                    }}
                  >
                    <p>Try adjusting your filters or add a new creator to get started.</p>
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
        onCreated={handleCreatorAdded}
      />

      <CreatorDetailModal
        open={detailOpen}
        influencer={selectedInfluencer}
        onClose={() => {
          setDetailOpen(false);
          setSelectedInfluencer(null);
        }}
        onUpdated={handleCreatorUpdated}
      />
    </Page>
  );
}
