import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Banner,
  BlockStack,
  Box,
  Button,
  InlineStack,
  Layout,
  Modal,
  Page,
  Spinner,
  Text,
} from '@shopify/polaris';
import {
  deleteSponsorshipRecord,
  fetchSponsorshipRecord,
  updateSponsorshipRecord,
} from '../api';
import {
  buildFormStateFromRecord,
  buildSavePayload,
  previewAmbassadorLevel,
} from '../constants';
import CreatorDetailSummaryMetrics from '../components/CreatorDetailSummaryMetrics';
import CreatorMonthlyProgressSection from '../components/CreatorMonthlyProgressSection';
import CreatorNotesCard from '../components/CreatorNotesCard';
import CreatorPlatformAccounts from '../components/CreatorPlatformAccounts';
import CreatorProfileHeader from '../components/CreatorProfileHeader';
import CreatorProfilePanel from '../components/CreatorProfilePanel';
import CreatorRelationshipPanel from '../components/CreatorRelationshipPanel';
import CreatorSponsorshipDetails from '../components/CreatorSponsorshipDetails';

const SECTION_KEYS = [
  'profile',
  'platforms',
  'sponsorship',
  'monthly',
  'relationship',
  'notes',
];

function createEditingState() {
  return SECTION_KEYS.reduce((state, key) => {
    state[key] = false;
    return state;
  }, {});
}

export default function CreatorDetailPage({ localPreview = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [record, setRecord] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingSections, setEditingSections] = useState(createEditingState);

  const clearEditingSections = useCallback(() => {
    setEditingSections(createEditingState());
  }, []);

  const setSectionEditing = useCallback((section, editing) => {
    setEditingSections((current) => ({
      ...current,
      [section]: editing,
    }));
  }, []);

  const loadRecord = useCallback(async () => {
    setLoading(true);
    setLoadError('');

    try {
      const data = await fetchSponsorshipRecord(id);
      setRecord(data);
      setForm(buildFormStateFromRecord(data));
      setError('');
      clearEditingSections();
    } catch (err) {
      setRecord(null);
      setForm(null);
      setLoadError(err.message || 'Failed to load creator record');
    } finally {
      setLoading(false);
    }
  }, [id, clearEditingSections]);

  useEffect(() => {
    loadRecord();
  }, [loadRecord]);

  useEffect(() => {
    if (location.state?.success) {
      setSuccess(location.state.success);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  const handleSave = async () => {
    if (!record || !form) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updated = await updateSponsorshipRecord(record.id, buildSavePayload(form));
      setRecord(updated);
      setForm(buildFormStateFromRecord(updated));
      clearEditingSections();
      setSuccess('Creator record updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to update record');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  const handleDeleteConfirm = async () => {
    if (!record) return;

    setDeleting(true);
    setError('');

    try {
      await deleteSponsorshipRecord(record.id);
      navigate('/', {
        state: { success: 'Creator record deleted successfully.' },
      });
    } catch (err) {
      setError(err.message || 'Failed to delete record');
      setDeleting(false);
    }
  };

  const sectionProps = (section) => ({
    editing: editingSections[section],
    onEdit: () => setSectionEditing(section, true),
    onDone: () => setSectionEditing(section, false),
  });

  if (loading) {
    return (
      <Page fullWidth className="crm-page crm-detail-page">
        <Layout>
          <Layout.Section>
            <Box padding="800">
              <InlineStack align="center" blockAlign="center" gap="300">
                <Spinner accessibilityLabel="Loading creator" size="large" />
                <Text as="span" tone="subdued">
                  Loading creator profile…
                </Text>
              </InlineStack>
            </Box>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  if (loadError || !record || !form) {
    return (
      <Page fullWidth className="crm-page crm-detail-page">
        <Layout>
          <Layout.Section>
            <BlockStack gap="400">
              <Button variant="plain" onClick={() => navigate('/')} className="crm-back-link">
                ← Back to Dashboard
              </Button>
              <Banner tone="critical" title="Creator not found">
                <p>{loadError || 'This creator record could not be loaded.'}</p>
              </Banner>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  const ambassadorLevel = previewAmbassadorLevel(form);

  return (
    <>
      <Page fullWidth className="crm-page crm-detail-page">
        <Layout>
          <Layout.Section>
            <BlockStack gap="800" className="crm-detail-stack">
              {localPreview ? (
                <Banner tone="info" title="Local preview mode">
                  <p>Previewing outside Shopify Admin. Data comes from LOCAL_DEV_SHOP.</p>
                </Banner>
              ) : null}

              {success ? (
                <Banner tone="success" onDismiss={() => setSuccess('')}>
                  <p>{success}</p>
                </Banner>
              ) : null}

              {error ? (
                <Banner tone="critical" title="Unable to save changes">
                  <p>{error}</p>
                </Banner>
              ) : null}

              <CreatorProfileHeader
                form={form}
                ambassadorLevel={ambassadorLevel}
                onBack={handleCancel}
                onSave={handleSave}
                saving={saving}
                deleting={deleting}
              />

              <CreatorDetailSummaryMetrics record={record} form={form} />

              <Box className="crm-detail-layout">
                <BlockStack gap="600" className="crm-detail-column">
                  <CreatorProfilePanel form={form} onChange={setForm} {...sectionProps('profile')} />
                </BlockStack>

                <BlockStack gap="600" className="crm-detail-column">
                  <CreatorPlatformAccounts form={form} onChange={setForm} {...sectionProps('platforms')} />
                  <CreatorSponsorshipDetails form={form} onChange={setForm} {...sectionProps('sponsorship')} />
                  <CreatorMonthlyProgressSection
                    periods={form.monthly_progress}
                    onChange={(monthly_progress) =>
                      setForm((current) => ({ ...current, monthly_progress }))
                    }
                    {...sectionProps('monthly')}
                  />
                </BlockStack>

                <BlockStack gap="600" className="crm-detail-column">
                  <CreatorRelationshipPanel
                    form={form}
                    onChange={setForm}
                    ambassadorLevel={ambassadorLevel}
                    {...sectionProps('relationship')}
                  />
                  <CreatorNotesCard form={form} onChange={setForm} {...sectionProps('notes')} />
                </BlockStack>
              </Box>
            </BlockStack>
          </Layout.Section>
        </Layout>

        <Box className="crm-detail-footer" padding="500">
          <InlineStack align="space-between" blockAlign="center" wrap gap="400">
            <Button
              tone="critical"
              onClick={() => setDeleteConfirmOpen(true)}
              disabled={deleting || saving}
            >
              Delete Creator
            </Button>
            <InlineStack gap="300" wrap={false}>
              <Button onClick={handleCancel} disabled={deleting || saving}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                loading={saving}
                disabled={deleting}
              >
                Save Changes
              </Button>
            </InlineStack>
          </InlineStack>
        </Box>
      </Page>

      <Modal
        open={deleteConfirmOpen}
        onClose={() => {
          if (!deleting) {
            setDeleteConfirmOpen(false);
          }
        }}
        title="Delete creator?"
        primaryAction={{
          content: 'Delete',
          onAction: handleDeleteConfirm,
          loading: deleting,
          destructive: true,
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: () => setDeleteConfirmOpen(false),
            disabled: deleting,
          },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="300">
            <Text as="p" variant="bodyMd">
              Delete <strong>{record.name}</strong>? This action cannot be undone.
            </Text>
          </BlockStack>
        </Modal.Section>
      </Modal>
    </>
  );
}
