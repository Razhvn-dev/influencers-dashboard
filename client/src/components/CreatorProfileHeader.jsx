import { useCallback, useMemo, useState } from 'react';
import {
  ActionList,
  Avatar,
  BlockStack,
  Box,
  Button,
  Icon,
  InlineStack,
  Popover,
  Text,
} from '@shopify/polaris';
import { ArrowLeftIcon } from '@shopify/polaris-icons';
import {
  creatorHandle,
  getCreatorInitials,
  normalizeExternalUrl,
  PLATFORM_META,
} from '../constants';
import LevelBadge from './dashboard/LevelBadge';
import StatusBadge from './dashboard/StatusBadge';

function primaryProfileUrl(record) {
  for (const platform of PLATFORM_META) {
    const url = normalizeExternalUrl(record?.[platform.key]);
    if (url) return url;
  }

  return null;
}

function displayHandle(record) {
  const handle = creatorHandle(record);
  if (handle && handle !== '—') {
    const explicitHandle = String(handle).match(/@[a-z0-9_.-]+/i);
    return explicitHandle ? explicitHandle[0] : handle;
  }

  const nameHandle = String(record?.name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');

  return nameHandle ? `@${nameHandle}` : '—';
}

export default function CreatorProfileHeader({
  form,
  ambassadorLevel,
  onBack,
  onEditProfile,
  onSave,
  saving = false,
  deleting = false,
}) {
  const [moreActionsOpen, setMoreActionsOpen] = useState(false);

  const profileRecord = useMemo(
    () => ({
      ...form,
      channel: form.channel,
      sponsored_products: form.sponsored_products,
      youtube_url: form.youtube_url,
      instagram_url: form.instagram_url,
      facebook_url: form.facebook_url,
      tiktok_url: form.tiktok_url,
    }),
    [form]
  );

  const handle = displayHandle(profileRecord);
  const profileUrl = primaryProfileUrl(profileRecord);
  const toggleMoreActions = useCallback(
    () => setMoreActionsOpen((open) => !open),
    []
  );
  const closeMoreActions = useCallback(() => setMoreActionsOpen(false), []);

  const navigation = (
    <BlockStack gap="300">
      <button type="button" className="crm-detail-back" onClick={onBack}>
        <Icon source={ArrowLeftIcon} />
        Back
      </button>
      <nav aria-label="Breadcrumb" className="crm-detail-breadcrumb">
        <span>Influencers CRM</span>
        <span className="crm-detail-breadcrumb__sep" aria-hidden="true">
          /
        </span>
        <span>Creators</span>
        <span className="crm-detail-breadcrumb__sep" aria-hidden="true">
          /
        </span>
        <strong>{form.name || 'Creator'}</strong>
      </nav>
    </BlockStack>
  );

  const actions = (
    <InlineStack gap="300" wrap={false} blockAlign="center" className="crm-detail-header__actions">
      <Popover
        active={moreActionsOpen}
        autofocusTarget="first-node"
        onClose={closeMoreActions}
        activator={
          <Button disclosure onClick={toggleMoreActions} disabled={saving || deleting}>
            More actions
          </Button>
        }
      >
        <ActionList
          items={[
            {
              content: 'Open public profile',
              disabled: !profileUrl,
              onAction: () => {
                closeMoreActions();
                if (profileUrl) window.open(profileUrl, '_blank', 'noopener,noreferrer');
              },
            },
            {
              content: 'Back to Dashboard',
              onAction: () => {
                closeMoreActions();
                onBack();
              },
            },
          ]}
        />
      </Popover>
      <Button onClick={onEditProfile} disabled={saving || deleting}>
        Edit Profile
      </Button>
      <Button variant="primary" onClick={onSave} loading={saving} disabled={deleting}>
        Save Changes
      </Button>
    </InlineStack>
  );

  const hero = (
    <InlineStack gap="500" blockAlign="center" wrap={false} className="crm-detail-hero">
      <Box className="crm-detail-header__avatar">
        <Avatar customer size="xl" name={form.name} initials={getCreatorInitials(form.name)} />
      </Box>

      <BlockStack gap="400" className="crm-detail-header__identity-text">
        <Text as="h1" variant="heading2xl" fontWeight="semibold" className="crm-detail-header__name">
          {form.name || 'Creator'}
        </Text>

        <Text as="span" variant="bodyMd" tone="subdued" className="crm-detail-header__handle">
          {handle}
        </Text>

        <InlineStack gap="200" wrap className="crm-detail-header__badges">
          {form.status ? <StatusBadge status={form.status} /> : null}
          {ambassadorLevel ? <LevelBadge level={ambassadorLevel} /> : null}
        </InlineStack>
      </BlockStack>
    </InlineStack>
  );

  return (
    <Box className="crm-detail-header">
      <InlineStack align="space-between" blockAlign="start" gap="500" wrap>
        {navigation}
        {actions}
      </InlineStack>
      {hero}
    </Box>
  );
}
