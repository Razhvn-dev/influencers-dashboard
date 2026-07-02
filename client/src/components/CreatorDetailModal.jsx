import { useEffect, useState } from 'react';
import {
  Banner,
  BlockStack,
  Divider,
  FormLayout,
  Modal,
  Select,
  Text,
  TextField,
} from '@shopify/polaris';
import { updateSponsorshipRecord } from '../api';
import {
  buildFormStateFromRecord,
  buildSavePayload,
  COMMISSION_OPTIONS,
  previewAmbassadorLevel,
} from '../constants';
import CreatorProfileEditor from './CreatorProfileEditor';
import MonthlyProgressEditor from './MonthlyProgressEditor';

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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (record) {
      setForm(buildFormStateFromRecord(record));
      setError('');
      setSuccess('');
    }
  }, [record]);

  if (!record || !form) {
    return null;
  }

  const updateField = (field) => (value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updated = await updateSponsorshipRecord(record.id, buildSavePayload(form));
      onUpdated(updated);
      setForm(buildFormStateFromRecord(updated));
      setSuccess('Creator record updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to update record');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete ${record.name}? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError('');

    try {
      await onDeleted(record.id);
    } catch (err) {
      setError(err.message || 'Failed to delete record');
      setDeleting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={record.name}
      size="large"
      primaryAction={{
        content: 'Save Changes',
        onAction: handleSave,
        loading: saving,
        disabled: deleting,
      }}
      secondaryActions={[
        { content: 'Close', onAction: onClose, disabled: deleting },
        {
          content: 'Delete Creator',
          onAction: handleDelete,
          loading: deleting,
          destructive: true,
        },
      ]}
    >
      <Modal.Section>
        <BlockStack gap="500">
          {error ? (
            <Banner tone="critical" title="Unable to save changes">
              <p>{error}</p>
            </Banner>
          ) : null}

          {success ? (
            <Banner tone="success" title="Changes saved">
              <p>{success}</p>
            </Banner>
          ) : null}

          <Text as="h3" variant="headingMd">
            Sponsorship Details
          </Text>

          <FormLayout>
            <TextField
              label="Name"
              value={form.name}
              onChange={updateField('name')}
              autoComplete="name"
              requiredIndicator
            />
            <TextField
              label="Channel"
              value={form.channel}
              onChange={updateField('channel')}
              autoComplete="off"
            />
            <TextField
              label="Sponsored Product(s)"
              value={form.sponsored_products}
              onChange={updateField('sponsored_products')}
              multiline={3}
              autoComplete="off"
            />
            <FormLayout.Group>
              <TextField
                label="Affiliate Code"
                value={form.affiliate_code}
                onChange={updateField('affiliate_code')}
                autoComplete="off"
              />
              <Select
                label="Commission"
                options={COMMISSION_OPTIONS}
                value={form.commission}
                onChange={updateField('commission')}
              />
            </FormLayout.Group>
            <TextField
              label="Order #'s"
              value={form.order_numbers}
              onChange={updateField('order_numbers')}
              multiline={2}
              autoComplete="off"
            />
            <TextField
              label="Required Deliverables per contract"
              value={form.required_deliverables}
              onChange={updateField('required_deliverables')}
              multiline={3}
              autoComplete="off"
            />
          </FormLayout>

          <Divider />

          <CreatorProfileEditor
            form={form}
            onChange={setForm}
            ambassadorLevel={previewAmbassadorLevel(form)}
          />

          <Divider />

          <MonthlyProgressEditor
            periods={form.monthly_progress}
            onChange={(monthly_progress) => setForm((current) => ({ ...current, monthly_progress }))}
          />
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
