import { useEffect, useState } from 'react';
import {
  Badge,
  Banner,
  BlockStack,
  Divider,
  FormLayout,
  InlineStack,
  Modal,
  Select,
  Text,
  TextField,
} from '@shopify/polaris';
import { updateInfluencer } from '../api';

const STATUS_OPTIONS = [
  { label: 'Contacted', value: 'Contacted' },
  { label: 'Approved', value: 'Approved' },
  { label: 'Partnered', value: 'Partnered' },
];

function toInputDate(value) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toISOString().slice(0, 16);
}

function fromInputDate(value) {
  if (!value) return null;
  return new Date(value).toISOString();
}

function buildFormState(influencer) {
  return {
    name: influencer.name || '',
    company_name: influencer.company_name || '',
    email: influencer.email || '',
    region: influencer.region || '',
    status: influencer.status || 'Contacted',
    notes: influencer.notes || '',
    youtube_followers: String(influencer.youtube_followers ?? 0),
    facebook_followers: String(influencer.facebook_followers ?? 0),
    instagram_followers: String(influencer.instagram_followers ?? 0),
    tiktok_followers: String(influencer.tiktok_followers ?? 0),
    contract_status: influencer.contract_status || '',
    products_requested: influencer.products_requested || '',
    deliverables: influencer.deliverables || '',
    last_contacted_at: toInputDate(influencer.last_contacted_at),
    next_followup_at: toInputDate(influencer.next_followup_at),
  };
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString('en-US');
}

export default function CreatorDetailModal({ open, influencer, onClose, onUpdated }) {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (influencer) {
      setForm(buildFormState(influencer));
      setError('');
      setSuccess('');
    }
  }, [influencer]);

  if (!influencer || !form) {
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
      const updated = await updateInfluencer(influencer.id, {
        name: form.name.trim(),
        company_name: form.company_name.trim() || null,
        email: form.email.trim() || null,
        region: form.region.trim() || null,
        status: form.status,
        notes: form.notes.trim() || null,
        youtube_followers: Number(form.youtube_followers) || 0,
        facebook_followers: Number(form.facebook_followers) || 0,
        instagram_followers: Number(form.instagram_followers) || 0,
        tiktok_followers: Number(form.tiktok_followers) || 0,
        contract_status: form.contract_status.trim() || null,
        products_requested: form.products_requested.trim() || null,
        deliverables: form.deliverables.trim() || null,
        last_contacted_at: fromInputDate(form.last_contacted_at),
        next_followup_at: fromInputDate(form.next_followup_at),
      });

      onUpdated(updated);
      setForm(buildFormState(updated));
      setSuccess('Creator profile updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to update creator');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={influencer.name}
      size="large"
      primaryAction={{
        content: 'Save Changes',
        onAction: handleSave,
        loading: saving,
      }}
      secondaryActions={[{ content: 'Close', onAction: onClose }]}
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

          <InlineStack gap="200">
            <Badge tone="info">{influencer.ambassador_level || 'Level 1'}</Badge>
            <Badge>{form.status}</Badge>
            <Text as="span" tone="subdued">
              Total followers:{' '}
              {formatNumber(
                Number(form.youtube_followers || 0) +
                  Number(form.facebook_followers || 0) +
                  Number(form.instagram_followers || 0) +
                  Number(form.tiktok_followers || 0)
              )}
            </Text>
          </InlineStack>

          <FormLayout>
            <FormLayout.Group>
              <TextField
                label="Name"
                value={form.name}
                onChange={updateField('name')}
                autoComplete="name"
                requiredIndicator
              />
              <TextField
                label="Company / Channel"
                value={form.company_name}
                onChange={updateField('company_name')}
                autoComplete="organization"
              />
            </FormLayout.Group>

            <FormLayout.Group>
              <TextField
                label="Email"
                type="email"
                value={form.email}
                onChange={updateField('email')}
                autoComplete="email"
              />
              <TextField
                label="Region"
                value={form.region}
                onChange={updateField('region')}
                autoComplete="off"
              />
            </FormLayout.Group>

            <Select
              label="Status"
              options={STATUS_OPTIONS}
              value={form.status}
              onChange={updateField('status')}
            />
          </FormLayout>

          <Divider />

          <Text as="h3" variant="headingMd">
            Platform Followers
          </Text>

          <FormLayout>
            <FormLayout.Group>
              <TextField
                label="YouTube"
                type="number"
                value={form.youtube_followers}
                onChange={updateField('youtube_followers')}
                autoComplete="off"
              />
              <TextField
                label="Facebook"
                type="number"
                value={form.facebook_followers}
                onChange={updateField('facebook_followers')}
                autoComplete="off"
              />
            </FormLayout.Group>
            <FormLayout.Group>
              <TextField
                label="Instagram"
                type="number"
                value={form.instagram_followers}
                onChange={updateField('instagram_followers')}
                autoComplete="off"
              />
              <TextField
                label="TikTok"
                type="number"
                value={form.tiktok_followers}
                onChange={updateField('tiktok_followers')}
                autoComplete="off"
              />
            </FormLayout.Group>
          </FormLayout>

          <Divider />

          <Text as="h3" variant="headingMd">
            CRM Follow-up
          </Text>

          <FormLayout>
            <TextField
              label="Notes"
              value={form.notes}
              onChange={updateField('notes')}
              multiline={4}
              autoComplete="off"
              helpText="Communication history and internal notes"
            />

            <FormLayout.Group>
              <TextField
                label="Last Contacted"
                type="datetime-local"
                value={form.last_contacted_at}
                onChange={updateField('last_contacted_at')}
                autoComplete="off"
              />
              <TextField
                label="Next Follow-up"
                type="datetime-local"
                value={form.next_followup_at}
                onChange={updateField('next_followup_at')}
                autoComplete="off"
              />
            </FormLayout.Group>

            <TextField
              label="Contract Status"
              value={form.contract_status}
              onChange={updateField('contract_status')}
              autoComplete="off"
            />

            <TextField
              label="Products Requested"
              value={form.products_requested}
              onChange={updateField('products_requested')}
              multiline={3}
              autoComplete="off"
            />

            <TextField
              label="Deliverables"
              value={form.deliverables}
              onChange={updateField('deliverables')}
              multiline={3}
              autoComplete="off"
            />
          </FormLayout>
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
