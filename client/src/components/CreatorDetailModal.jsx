import { useCallback, useEffect, useState } from 'react';
import {
  Banner,
  BlockStack,
  Box,
  Button,
  InlineStack,
  Modal,
  Text,
} from '@shopify/polaris';
import { updateSponsorshipRecord } from '../api';
import {
  buildFormStateFromRecord,
  buildSavePayload,
  previewAmbassadorLevel,
} from '../constants';
import CreatorDetailSummaryMetrics from './CreatorDetailSummaryMetrics';
import CreatorMonthlyProgressSection from './CreatorMonthlyProgressSection';
import CreatorNotesCard from './CreatorNotesCard';
import CreatorPlatformAccounts from './CreatorPlatformAccounts';
import CreatorProfileHeader from './CreatorProfileHeader';
import CreatorProfilePanel from './CreatorProfilePanel';
import CreatorRelationshipPanel from './CreatorRelationshipPanel';
import CreatorSponsorshipDetails from './CreatorSponsorshipDetails';

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

export default function CreatorDetailModal({
  open,
  influencer: record,
  onClose,
  onUpdated,
  onDeleted,
}) {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [error, setError] = useState('');
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

  useEffect(() => {
    if (record) {
      setForm(buildFormStateFromRecord(record));
      setError('');
      setDeleteConfirmOpen(false);
      setDeleting(false);
      setSaving(false);
      clearEditingSections();
    }
  }, [record, clearEditingSections]);

  useEffect(() => {
    if (!open) {
      setDeleteConfirmOpen(false);
      setDeleting(false);
      setSaving(false);
      clearEditingSections();
    }
  }, [open, clearEditingSections]);

  if (!record || !form) {
    return null;
  }

  const ambassadorLevel = previewAmbassadorLevel(form);

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      const updated = await updateSponsorshipRecord(record.id, buildSavePayload(form));
      clearEditingSections();
      onUpdated(updated);
    } catch (err) {
      setError(err.message || 'Failed to update record');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(buildFormStateFromRecord(record));
    clearEditingSections();
    onClose();
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    setError('');

    try {
      await onDeleted(record.id);
      setDeleteConfirmOpen(false);
      setDeleting(false);
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

  return (
    <>
      <Modal open={open} onClose={handleCancel} title={record.name} size="large" instant>
        <div className="crm-detail-modal">
          <Modal.Section>
            <BlockStack gap="800" className="crm-detail-stack">
              {error ? (
                <Banner tone="critical" title="Unable to save changes">
                  <p>{error}</p>
                </Banner>
              ) : null}

              <CreatorProfileHeader
                form={form}
                ambassadorLevel={ambassadorLevel}
                onClose={handleCancel}
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
          </Modal.Section>

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
        </div>
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
