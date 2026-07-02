import { useState } from 'react';
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
import { createSponsorshipRecord } from '../api';
import {
  buildEmptyCreatorForm,
  buildSavePayload,
  COMMISSION_OPTIONS,
  previewAmbassadorLevel,
} from '../constants';
import CreatorProfileEditor from './CreatorProfileEditor';
import MonthlyProgressEditor from './MonthlyProgressEditor';

export default function AddCreatorModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState(buildEmptyCreatorForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const updateField = (field) => (value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleClose = () => {
    setForm(buildEmptyCreatorForm());
    setError('');
    onClose();
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      await createSponsorshipRecord(buildSavePayload(form));
      setForm(buildEmptyCreatorForm());
      onCreated();
    } catch (err) {
      setError(err.message || 'Failed to create record');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add Creator"
      size="large"
      primaryAction={{
        content: 'Save',
        onAction: handleSave,
        loading: saving,
      }}
      secondaryActions={[{ content: 'Cancel', onAction: handleClose }]}
    >
      <Modal.Section>
        <BlockStack gap="500">
          {error ? (
            <Banner tone="critical" title="Unable to save record">
              <p>{error}</p>
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
