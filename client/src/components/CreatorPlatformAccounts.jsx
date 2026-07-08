import {
  BlockStack,
  Box,
  InlineGrid,
  InlineStack,
  Text,
  TextField,
} from '@shopify/polaris';
import {
  formatCompactNumber,
  normalizeExternalUrl,
  openExternalUrl,
  parseFollowerCount,
  PLATFORM_META,
  platformHandleFromUrl,
  sanitizeFollowerInput,
} from '../constants';
import { CreatorSectionCardShell } from './CreatorSectionCard';
import PlatformIcon from './PlatformIcon';
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

function PlatformReadRow({ platform, form }) {
  const url = form[platform.key];
  const hasUrl = Boolean(normalizeExternalUrl(url));
  const followerCount = parseFollowerCount(form[platform.followerField]);
  const handle = platformHandleFromUrl(url);

  return (
    <Box className="crm-platform-read-row" padding="500">
      <InlineStack align="space-between" blockAlign="center" wrap gap="400">
        <InlineStack gap="400" blockAlign="center" wrap={false}>
          <PlatformIcon platformKey={platform.key} size="large" withTooltip={false} />
          <BlockStack gap="100">
            <Text as="p" variant="bodyMd" fontWeight="semibold">
              {platform.label}
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              {hasUrl ? handle : 'Not connected'}
            </Text>
          </BlockStack>
        </InlineStack>

        <InlineStack gap="500" blockAlign="center" wrap={false}>
          <Text as="span" variant="bodyLg" fontWeight="bold" className="crm-platform-followers">
            {formatCompactNumber(followerCount)}
          </Text>
          {hasUrl ? (
            <button
              type="button"
              className="crm-open-link"
              onClick={() => openExternalUrl(url)}
            >
              Open ↗
            </button>
          ) : null}
        </InlineStack>
      </InlineStack>
    </Box>
  );
}

function PlatformEditRow({ platform, form, onChange }) {
  const updateField = (field) => (value) => {
    onChange({ ...form, [field]: value });
  };

  return (
    <Box className="crm-platform-account-row" padding="400">
      <InlineGrid columns={{ xs: 1, md: 'auto 1fr 160px' }} gap="400" alignItems="center">
        <InlineStack gap="300" blockAlign="center" wrap={false}>
          <PlatformIcon platformKey={platform.key} size="large" withTooltip={false} />
          <Text as="p" variant="bodyMd" fontWeight="semibold">
            {platform.label}
          </Text>
        </InlineStack>

        <UrlFieldWithOpen
          label={`${platform.label} URL`}
          labelHidden
          value={form[platform.key]}
          onChange={updateField(platform.key)}
          placeholder={`${platform.label.toLowerCase()}.com/...`}
        />

        <TextField
          label={`${platform.label} followers`}
          type="number"
          min={0}
          placeholder="0"
          {...followerFieldProps(platform.followerField, form, onChange)}
        />
      </InlineGrid>
    </Box>
  );
}

export default function CreatorPlatformAccounts({
  form,
  onChange,
  editing = false,
  onEdit,
  onDone,
}) {
  const totalFollowers =
    parseFollowerCount(form.youtube_followers) +
    parseFollowerCount(form.facebook_followers) +
    parseFollowerCount(form.instagram_followers) +
    parseFollowerCount(form.tiktok_followers);

  const readContent = (
    <BlockStack gap="0">
      {PLATFORM_META.map((platform, index) => (
        <Box
          key={platform.key}
          borderBlockStartWidth={index === 0 ? '025' : undefined}
          borderBlockEndWidth="025"
          borderColor="border"
        >
          <PlatformReadRow platform={platform} form={form} />
        </Box>
      ))}
      <Box padding="400" background="bg-surface-secondary">
        <Text as="p" tone="subdued" variant="bodySm">
          Counts are not synced from platform APIs. Last Verified updates when follower
          counts are saved.
        </Text>
      </Box>
    </BlockStack>
  );

  const editContent = (
    <BlockStack gap="0">
      {PLATFORM_META.map((platform, index) => (
        <Box
          key={platform.key}
          borderBlockStartWidth={index === 0 ? '025' : undefined}
          borderBlockEndWidth="025"
          borderColor="border"
        >
          <PlatformEditRow platform={platform} form={form} onChange={onChange} />
        </Box>
      ))}
      <Box padding="400" background="bg-surface-secondary">
        <Text as="p" tone="subdued" variant="bodySm">
          Paste profile URLs, open public pages, and enter follower counts manually.
        </Text>
      </Box>
    </BlockStack>
  );

  return (
    <CreatorSectionCardShell
      title="Platform Accounts"
      editing={editing}
      onEdit={onEdit}
      onDone={onDone}
      headerExtra={
        <Text as="p" variant="bodySm" tone="subdued">
          Total{' '}
          <Text as="span" fontWeight="semibold">
            {formatCompactNumber(totalFollowers)}
          </Text>
        </Text>
      }
      readContent={readContent}
      editContent={editContent}
    />
  );
}
