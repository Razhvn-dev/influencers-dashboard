import { BlockStack, Box, Icon, InlineGrid, Text, TextField } from '@shopify/polaris';
import { ExternalSmallIcon } from '@shopify/polaris-icons';
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
  const handle = hasUrl ? platformHandleFromUrl(url) : 'Not connected';

  return (
    <div className="crm-detail-platform-row">
      <div className="crm-detail-platform-row__identity">
        <PlatformIcon platformKey={platform.key} size="large" withTooltip={false} />
        <span className="crm-detail-platform-row__name">{platform.label}</span>
      </div>

      <div className="crm-detail-platform-row__url">
        {hasUrl ? (
          <button
            type="button"
            className="crm-detail-url-pill"
            onClick={() => openExternalUrl(url)}
          >
            <span>{handle}</span>
            <Icon source={ExternalSmallIcon} />
          </button>
        ) : (
          <span className="crm-detail-muted">Not connected</span>
        )}
      </div>

      <div className="crm-detail-platform-row__action">
        {hasUrl ? (
          <button
            type="button"
            className="crm-detail-open-button"
            onClick={() => openExternalUrl(url)}
          >
            Open
          </button>
        ) : null}
      </div>

      <div className="crm-detail-platform-row__followers">
        <span className="crm-detail-platform-row__count">
          {hasUrl || followerCount > 0 ? formatCompactNumber(followerCount) : 'Not connected'}
        </span>
        <span className="crm-detail-platform-row__verified">Manual count</span>
      </div>
    </div>
  );
}

function PlatformEditRow({ platform, form, onChange }) {
  const updateField = (field) => (value) => {
    onChange({ ...form, [field]: value });
  };

  return (
    <Box className="crm-platform-account-row" padding="400">
      <InlineGrid columns={{ xs: 1, md: 'auto 1fr 160px' }} gap="400" alignItems="center">
        <div className="crm-detail-platform-edit-label">
          <PlatformIcon platformKey={platform.key} size="large" withTooltip={false} />
          <span>{platform.label}</span>
        </div>

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
      <div className="crm-detail-platform-note">
        Counts are not synced from platform APIs. Last verified updates when follower
        counts are saved.
      </div>
      {PLATFORM_META.map((platform) => (
        <PlatformReadRow key={platform.key} platform={platform} form={form} />
      ))}
    </BlockStack>
  );

  const editContent = (
    <BlockStack gap="0">
      {PLATFORM_META.map((platform) => (
        <PlatformEditRow key={platform.key} platform={platform} form={form} onChange={onChange} />
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
      title="Platform Links & Followers"
      editing={editing}
      onEdit={onEdit}
      onDone={onDone}
      headerExtra={
        <div className="crm-detail-section-total">
          <span>Total Followers</span>
          <strong>{formatCompactNumber(totalFollowers)}</strong>
        </div>
      }
      readContent={readContent}
      editContent={editContent}
    />
  );
}
