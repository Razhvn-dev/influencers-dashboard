import {
  BlockStack,
  Box,
  Card,
  FormLayout,
  InlineGrid,
  InlineStack,
  Select,
  Text,
  TextField,
} from '@shopify/polaris';
import {
  displayAmbassadorLevel,
  parseFollowerCount,
  PLATFORM_META,
  sanitizeFollowerInput,
  STATUS_OPTIONS,
} from '../constants';
import DateTimeField from './DateTimeField';
import SocialProfileButtons from './SocialProfileButtons';
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

function PlatformRow({ platform, form, onChange }) {
  const updateField = (field) => (value) => {
    onChange({ ...form, [field]: value });
  };

  return (
    <Box
      padding="300"
      borderBlockEndWidth="025"
      borderColor="border"
      background="bg-surface"
    >
      <InlineGrid columns={{ xs: 1, md: '140px 1fr 160px' }} gap="300" alignItems="start">
        <BlockStack gap="100">
          <Text as="p" variant="bodyMd" fontWeight="semibold">
            {platform.label}
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            {platform.shortLabel}
          </Text>
        </BlockStack>

        <UrlFieldWithOpen
          label={`${platform.label} URL`}
          labelHidden
          value={form[platform.key]}
          onChange={updateField(platform.key)}
          placeholder={`${platform.label.toLowerCase()}.com/...`}
        />

        <TextField
          label={`${platform.label} followers`}
          labelHidden
          placeholder="Followers"
          {...followerFieldProps(platform.followerField, form, onChange)}
        />
      </InlineGrid>
    </Box>
  );
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

      <Card padding="400">
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
      </Card>

      <BlockStack gap="200">
        <InlineStack align="space-between" blockAlign="center" wrap>
          <BlockStack gap="100">
            <Text as="h3" variant="headingMd">
              Platforms
            </Text>
            <Text as="p" tone="subdued" variant="bodySm">
              Paste profile URLs, open public pages, and enter follower counts manually.
            </Text>
          </BlockStack>
          <Text as="p" variant="bodySm" tone="subdued">
            Total:{' '}
            <Text as="span" fontWeight="semibold">
              {totalFollowers.toLocaleString('en-US')}
            </Text>{' '}
            · {displayAmbassadorLevel(ambassadorLevel)}
          </Text>
        </InlineStack>

        <SocialProfileButtons form={form} />

        <Card padding="0">
          <Box
            padding="300"
            background="bg-surface-secondary"
            borderBlockEndWidth="025"
            borderColor="border"
          >
            <InlineGrid columns={{ xs: 1, md: '140px 1fr 160px' }} gap="300">
              <Text as="span" variant="bodySm" tone="subdued" fontWeight="semibold">
                Platform
              </Text>
              <Text as="span" variant="bodySm" tone="subdued" fontWeight="semibold">
                Profile link
              </Text>
              <Text as="span" variant="bodySm" tone="subdued" fontWeight="semibold">
                Followers
              </Text>
            </InlineGrid>
          </Box>

          {PLATFORM_META.map((platform) => (
            <PlatformRow
              key={platform.key}
              platform={platform}
              form={form}
              onChange={onChange}
            />
          ))}
        </Card>

        <Text as="p" tone="subdued" variant="bodySm">
          Counts are not synced from platform APIs. Last Verified updates when follower counts
          are saved.
        </Text>
      </BlockStack>
    </BlockStack>
  );
}
