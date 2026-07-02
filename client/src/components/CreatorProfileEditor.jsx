import {
  BlockStack,
  Divider,
  FormLayout,
  Select,
  Text,
  TextField,
} from '@shopify/polaris';
import {
  STATUS_OPTIONS,
  displayAmbassadorLevel,
} from '../constants';

function toInputDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 16);
}

export default function CreatorProfileEditor({ form, onChange, ambassadorLevel }) {
  const updateField = (field) => (value) => {
    onChange({ ...form, [field]: value });
  };

  const totalFollowers =
    Number(form.youtube_followers || 0) +
    Number(form.facebook_followers || 0) +
    Number(form.instagram_followers || 0) +
    Number(form.tiktok_followers || 0);

  return (
    <BlockStack gap="400">
      <Text as="h3" variant="headingMd">
        Creator Profile
      </Text>

      <FormLayout>
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
          label="Partnership Status"
          options={STATUS_OPTIONS}
          value={form.status}
          onChange={updateField('status')}
        />

        <TextField
          label="Notes"
          value={form.notes}
          onChange={updateField('notes')}
          multiline={3}
          autoComplete="off"
          helpText="Outreach notes and communication history"
        />

        <TextField
          label="Contract Status"
          value={form.contract_status}
          onChange={updateField('contract_status')}
          autoComplete="off"
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
      </FormLayout>

      <Divider />

      <Text as="h3" variant="headingMd">
        Platform Links
      </Text>

      <FormLayout>
        <FormLayout.Group>
          <TextField
            label="YouTube URL"
            value={form.youtube_url}
            onChange={updateField('youtube_url')}
            autoComplete="off"
          />
          <TextField
            label="Instagram URL"
            value={form.instagram_url}
            onChange={updateField('instagram_url')}
            autoComplete="off"
          />
        </FormLayout.Group>
        <FormLayout.Group>
          <TextField
            label="Facebook URL"
            value={form.facebook_url}
            onChange={updateField('facebook_url')}
            autoComplete="off"
          />
          <TextField
            label="TikTok URL"
            value={form.tiktok_url}
            onChange={updateField('tiktok_url')}
            autoComplete="off"
          />
        </FormLayout.Group>
      </FormLayout>

      <Divider />

      <Text as="h3" variant="headingMd">
        Platform Followers
      </Text>

      <Text as="p" tone="subdued">
        Ambassador level:{' '}
        <strong>{displayAmbassadorLevel(ambassadorLevel)}</strong> · Total followers:{' '}
        <strong>{totalFollowers.toLocaleString('en-US')}</strong>
      </Text>

      <FormLayout>
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
  );
}

export { toInputDate };
