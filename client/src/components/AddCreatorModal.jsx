import { useState } from 'react';
import {
  Banner,
  BlockStack,
  FormLayout,
  Modal,
  Select,
  TextField,
} from '@shopify/polaris';
import { createInfluencer } from '../api';

const STATUS_OPTIONS = [
  { label: 'Contacted', value: 'Contacted' },
  { label: 'Approved', value: 'Approved' },
  { label: 'Partnered', value: 'Partnered' },
];

const INITIAL_FORM = {
  name: '',
  company_name: '',
  email: '',
  region: '',
  status: 'Contacted',
  youtube_followers: '0',
  facebook_followers: '0',
  instagram_followers: '0',
  tiktok_followers: '0',
};

export default function AddCreatorModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const updateField = (field) => (value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleClose = () => {
    setForm(INITIAL_FORM);
    setError('');
    onClose();
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      await createInfluencer({
        name: form.name.trim(),
        company_name: form.company_name.trim() || null,
        email: form.email.trim() || null,
        region: form.region.trim() || null,
        status: form.status,
        youtube_followers: Number(form.youtube_followers) || 0,
        facebook_followers: Number(form.facebook_followers) || 0,
        instagram_followers: Number(form.instagram_followers) || 0,
        tiktok_followers: Number(form.tiktok_followers) || 0,
      });

      setForm(INITIAL_FORM);
      onCreated();
    } catch (err) {
      setError(err.message || 'Failed to create creator');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add New Creator"
      primaryAction={{
        content: 'Save Creator',
        onAction: handleSave,
        loading: saving,
      }}
      secondaryActions={[{ content: 'Cancel', onAction: handleClose }]}
    >
      <Modal.Section>
        <BlockStack gap="400">
          {error ? (
            <Banner tone="critical" title="Unable to save creator">
              <p>{error}</p>
            </Banner>
          ) : null}

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
                placeholder="e.g. US"
                autoComplete="off"
              />
            </FormLayout.Group>

            <Select
              label="Status"
              options={STATUS_OPTIONS}
              value={form.status}
              onChange={updateField('status')}
            />

            <FormLayout.Group>
              <TextField
                label="YouTube Followers"
                type="number"
                value={form.youtube_followers}
                onChange={updateField('youtube_followers')}
                autoComplete="off"
              />
              <TextField
                label="Facebook Followers"
                type="number"
                value={form.facebook_followers}
                onChange={updateField('facebook_followers')}
                autoComplete="off"
              />
            </FormLayout.Group>

            <FormLayout.Group>
              <TextField
                label="Instagram Followers"
                type="number"
                value={form.instagram_followers}
                onChange={updateField('instagram_followers')}
                autoComplete="off"
              />
              <TextField
                label="TikTok Followers"
                type="number"
                value={form.tiktok_followers}
                onChange={updateField('tiktok_followers')}
                autoComplete="off"
              />
            </FormLayout.Group>
          </FormLayout>
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
