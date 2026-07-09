import { useCallback, useEffect, useMemo, useState } from 'react';
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
import CreatorRecentActivity from '../components/CreatorRecentActivity';
import CreatorSponsorshipDetails from '../components/CreatorSponsorshipDetails';
import { useAutoDismiss } from '../hooks/useAutoDismiss';

const SUCCESS_DISMISS_MS = 3000;

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
  const [isEditing, setIsEditing] = useState(false);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [leaveConfirmMode, setLeaveConfirmMode] = useState('back');

  const dismissSuccess = useCallback(() => setSuccess(''), []);
  useAutoDismiss(success, dismissSuccess, SUCCESS_DISMISS_MS);

  const loadRecord = useCallback(async () => {
    setLoading(true);
    setLoadError('');

    try {
      const data = await fetchSponsorshipRecord(id);
      setRecord(data);
      setForm(buildFormStateFromRecord(data));
      setError('');
      setIsEditing(false);
    } catch (err) {
      setRecord(null);
      setForm(null);
      setLoadError(err.message || 'Failed to load creator record');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadRecord();
  }, [loadRecord]);

  useEffect(() => {
    if (location.state?.success) {
      setSuccess(location.state.success);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  const savedSnapshot = useMemo(
    () => (record ? JSON.stringify(buildFormStateFromRecord(record)) : ''),
    [record]
  );
  const currentSnapshot = useMemo(() => JSON.stringify(form), [form]);
  const isDirty = Boolean(record && form && savedSnapshot !== currentSnapshot);
  const showFooter = isEditing;

  const dismissLeaveConfirm = useCallback(() => {
    setLeaveConfirmOpen(false);
  }, []);

  const resetFormToSaved = useCallback(() => {
    if (record) {
      setForm(buildFormStateFromRecord(record));
    }
    setIsEditing(false);
    setError('');
  }, [record]);

  const handleSave = async () => {
    if (!record || !form) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updated = await updateSponsorshipRecord(record.id, buildSavePayload(form));
      setRecord(updated);
      setForm(buildFormStateFromRecord(updated));
      setIsEditing(false);
      setSuccess('Creator record updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to update record');
    } finally {
      setSaving(false);
    }
  };

  const exitEditMode = useCallback(() => {
    if (isDirty) {
      setLeaveConfirmMode('discard');
      setLeaveConfirmOpen(true);
      return;
    }

    resetFormToSaved();
  }, [isDirty, resetFormToSaved]);

  const handleBack = () => {
    if (isDirty) {
      setLeaveConfirmMode('back');
      setLeaveConfirmOpen(true);
      return;
    }

    setIsEditing(false);
    navigate('/');
  };

  const handleConfirmLeave = () => {
    setLeaveConfirmOpen(false);

    if (leaveConfirmMode === 'back') {
      resetFormToSaved();
      navigate('/');
      return;
    }

    resetFormToSaved();
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

  const handleFooterCancel = () => {
    if (isDirty || isEditing) {
      exitEditMode();
      return;
    }

    handleBack();
  };

  return (
    <>
      <Page
        fullWidth
        className={`crm-page crm-detail-page${showFooter ? ' crm-detail-page--footer-visible' : ''}${isEditing ? ' crm-detail-page--editing' : ''}`}
      >
        <Layout>
          <Layout.Section>
            <BlockStack gap="500" className="crm-detail-stack">
              {success ? (
                <Box className="crm-detail-success-banner">
                  <Banner tone="success" onDismiss={dismissSuccess}>
                    <p>{success}</p>
                  </Banner>
                </Box>
              ) : null}

              {error ? (
                <Banner tone="critical" title="Unable to save changes">
                  <p>{error}</p>
                </Banner>
              ) : null}

              <CreatorProfileHeader
                form={form}
                ambassadorLevel={ambassadorLevel}
                onBack={handleBack}
                onStartEdit={() => setIsEditing(true)}
                onDelete={() => setDeleteConfirmOpen(true)}
                isEditing={isEditing}
                saving={saving}
                deleting={deleting}
                metrics={
                  isEditing ? null : (
                    <CreatorDetailSummaryMetrics record={record} form={form} />
                  )
                }
              />

              {isEditing ? (
                <BlockStack gap="600" className="crm-detail-edit-stack">
                  <CreatorProfilePanel
                    form={form}
                    record={record}
                    onChange={setForm}
                    editing
                  />
                  <CreatorNotesCard
                    record={record}
                    form={form}
                    onChange={setForm}
                    editing
                  />
                  <CreatorPlatformAccounts form={form} onChange={setForm} editing />
                  <CreatorSponsorshipDetails form={form} onChange={setForm} editing />
                  <CreatorMonthlyProgressSection
                    periods={form.monthly_progress}
                    onChange={(monthly_progress) =>
                      setForm((current) => ({ ...current, monthly_progress }))
                    }
                    editing
                  />
                </BlockStack>
              ) : (
                <Box className="crm-detail-layout crm-detail-layout--two-col">
                  <BlockStack gap="400" className="crm-detail-column crm-detail-column--person">
                    <CreatorProfilePanel
                      form={form}
                      record={record}
                      onChange={setForm}
                      editing={false}
                    />
                    <CreatorNotesCard
                      record={record}
                      form={form}
                      onChange={setForm}
                      editing={false}
                    />
                    <CreatorRecentActivity record={record} form={form} />
                  </BlockStack>

                  <BlockStack gap="400" className="crm-detail-column crm-detail-column--business">
                    <CreatorPlatformAccounts form={form} onChange={setForm} editing={false} />
                    <CreatorSponsorshipDetails form={form} onChange={setForm} editing={false} />
                    <CreatorMonthlyProgressSection
                      periods={form.monthly_progress}
                      onChange={(monthly_progress) =>
                        setForm((current) => ({ ...current, monthly_progress }))
                      }
                      editing={false}
                    />
                  </BlockStack>
                </Box>
              )}
            </BlockStack>
          </Layout.Section>
        </Layout>

        {showFooter ? (
          <Box className="crm-detail-footer">
            <InlineStack align="end" blockAlign="center" wrap gap="400">
              <InlineStack gap="300" wrap={false}>
                <Button
                  variant="secondary"
                  className="crm-detail-footer__cancel"
                  onClick={handleFooterCancel}
                  disabled={deleting || saving}
                >
                  {isDirty ? 'Discard changes' : 'Cancel editing'}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  loading={saving}
                  disabled={deleting || !isDirty}
                >
                  Save Changes
                </Button>
              </InlineStack>
            </InlineStack>
          </Box>
        ) : null}
      </Page>

      <Modal
        open={leaveConfirmOpen}
        onClose={dismissLeaveConfirm}
        title={leaveConfirmMode === 'back' ? 'Leave without saving?' : 'Discard unsaved changes?'}
        primaryAction={{
          content: leaveConfirmMode === 'back' ? 'Leave without saving' : 'Discard changes',
          onAction: handleConfirmLeave,
          destructive: true,
        }}
        secondaryActions={[
          {
            content: 'Keep editing',
            onAction: dismissLeaveConfirm,
          },
        ]}
      >
        <Modal.Section>
          <Text as="p" variant="bodyMd">
            You have unsaved changes that will be lost if you leave this page.
          </Text>
        </Modal.Section>
      </Modal>

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
