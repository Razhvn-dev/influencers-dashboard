import {
  BlockStack,
  Divider,
  FormLayout,
  Select,
  Text,
  TextField,
} from '@shopify/polaris';
import {
  displayAmbassadorLevel,
  parseFollowerCount,
  sanitizeFollowerInput,
  STATUS_OPTIONS,
} from '../constants';
import DateTimeField from './DateTimeField';
import UrlFieldWithOpen from './UrlFieldWithOpen';

function followerFieldProps(field, form, onChange) {
  return {
    type: 'number',
    min: 0,
    value: form[field],
    autoComplete: 'off',
    onChange: (value) => onChange({ ...form, [field]: sanitizeFollowerInput(value) }),
  };
}

export default function CreatorProfileEditor({ form, onChange, ambassadorLevel }) {
  const updateField = (field) => (value) => {
    onChange({ ...form, [field]: value });
  };

  const totalFollowers =
    parseFollowerCount(form.youtube_followers) +
    parseFollowerCount(form.facebook_followers) +
    parseFollowerCount(form.instagram_followers) +
    parseFollowerCount(form.tiktok_followers);

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
          <DateTimeField
            label="Last Contacted"
            value={form.last_contacted_at}
            onChange={updateField('last_contacted_at')}
            helpText="When you last reached out to this creator"
          />
          <DateTimeField
            label="Next Follow-up"
            value={form.next_followup_at}
            onChange={updateField('next_followup_at')}
            helpText="Used for the Due for follow-up filter (within 7 days)"
          />
        </FormLayout.Group>
      </FormLayout>

      <Divider />

      <Text as="h3" variant="headingMd">
        Platform Links
      </Text>
      <Text as="p" tone="subdued" variant="bodySm">
        Paste a profile URL and click Open to visit the page in a new tab.
      </Text>

      <FormLayout>
        <FormLayout.Group>
          <UrlFieldWithOpen
            label="YouTube URL"
            value={form.youtube_url}
            onChange={updateField('youtube_url')}
            placeholder="youtube.com/@channel"
          />
          <UrlFieldWithOpen
            label="Instagram URL"
            value={form.instagram_url}
            onChange={updateField('instagram_url')}
            placeholder="instagram.com/username"
          />
        </FormLayout.Group>
        <FormLayout.Group>
          <UrlFieldWithOpen
            label="Facebook URL"
            value={form.facebook_url}
            onChange={updateField('facebook_url')}
            placeholder="facebook.com/page"
          />
          <UrlFieldWithOpen
            label="TikTok URL"
            value={form.tiktok_url}
            onChange={updateField('tiktok_url')}
            placeholder="tiktok.com/@username"
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
            {...followerFieldProps('youtube_followers', form, onChange)}
          />
          <TextField
            label="Facebook Followers"
            {...followerFieldProps('facebook_followers', form, onChange)}
          />
        </FormLayout.Group>
        <FormLayout.Group>
          <TextField
            label="Instagram Followers"
            {...followerFieldProps('instagram_followers', form, onChange)}
          />
          <TextField
            label="TikTok Followers"
            {...followerFieldProps('tiktok_followers', form, onChange)}
          />
        </FormLayout.Group>
      </FormLayout>
    </BlockStack>
  );
}
