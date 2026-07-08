import { useCallback, useMemo, useState } from 'react';
import {
  ActionList,
  Avatar,
  Badge,
  BlockStack,
  Box,
  Button,
  Icon,
  InlineStack,
  Popover,
  Text,
} from '@shopify/polaris';
import { ChevronLeftIcon, ExternalIcon } from '@shopify/polaris-icons';
import {
  creatorHandle,
  creatorTagline,
  displayAmbassadorLevel,
  getCreatorInitials,
  levelTone,
  normalizeExternalUrl,
  PLATFORM_META,
  statusTone,
} from '../constants';

function primaryProfileUrl(record) {
  for (const platform of PLATFORM_META) {
    const url = normalizeExternalUrl(record?.[platform.key]);
    if (url) return url;
  }

  return null;
}

export default function CreatorProfileHeader({
  form,
  ambassadorLevel,
  onBack,
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

  const handle = creatorHandle(profileRecord);
  const categoryLabel = creatorTagline(profileRecord, 56);
  const profileUrl = primaryProfileUrl(profileRecord);
  const toggleMoreActions = useCallback(
    () => setMoreActionsOpen((open) => !open),
    []
  );
  const closeMoreActions = useCallback(() => setMoreActionsOpen(false), []);

  return (
    <Box className="crm-detail-header">
      <BlockStack gap="800">
        <nav aria-label="Breadcrumb" className="crm-detail-breadcrumb">
          <InlineStack gap="150" blockAlign="center" wrap>
            <button type="button" className="crm-breadcrumb-back" onClick={onBack}>
              <Icon source={ChevronLeftIcon} tone="subdued" />
              <span>Influencers CRM</span>
            </button>
            <span className="crm-breadcrumb-separator" aria-hidden="true">
              ›
            </span>
            <button type="button" className="crm-breadcrumb-link" onClick={onBack}>
              Creators
            </button>
            <span className="crm-breadcrumb-separator" aria-hidden="true">
              ›
            </span>
            <span className="crm-breadcrumb-current">{form.name || 'Creator'}</span>
          </InlineStack>
        </nav>

        <InlineStack
          align="space-between"
          blockAlign="center"
          wrap={false}
          gap="600"
          className="crm-detail-header__main"
        >
          <InlineStack gap="500" blockAlign="center" wrap={false} className="crm-detail-header__identity">
            <Box className="crm-detail-header__avatar">
              <Avatar
                customer
                size="xl"
                name={form.name}
                initials={getCreatorInitials(form.name)}
              />
            </Box>

            <BlockStack gap="300" className="crm-detail-header__identity-text">
              <Text as="h1" variant="heading2xl" fontWeight="bold" className="crm-detail-header__name">
                {form.name || 'Creator'}
              </Text>

              <InlineStack gap="150" blockAlign="center" wrap={false}>
                <Text as="span" variant="bodySm" tone="subdued" className="crm-detail-header__handle">
                  {handle}
                </Text>
                {profileUrl ? (
                  <a
                    href={profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="crm-detail-header__handle-link"
                    aria-label="Open creator profile"
                  >
                    <Icon source={ExternalIcon} tone="subdued" />
                  </a>
                ) : null}
              </InlineStack>

              {categoryLabel !== '—' ? (
                <Box className="crm-detail-header__category">{categoryLabel}</Box>
              ) : null}

              <InlineStack gap="300" wrap className="crm-detail-header__badges">
                {form.status ? (
                  <Badge tone={statusTone(form.status)}>{form.status}</Badge>
                ) : null}
                <Badge tone={levelTone(ambassadorLevel)}>
                  {displayAmbassadorLevel(ambassadorLevel)}
                </Badge>
              </InlineStack>
            </BlockStack>
          </InlineStack>

          <InlineStack gap="300" wrap={false} blockAlign="center" className="crm-detail-header__actions">
            <Popover
              active={moreActionsOpen}
              autofocusTarget="first-node"
              onClose={closeMoreActions}
              activator={
                <Button
                  disclosure
                  onClick={toggleMoreActions}
                  disabled={saving || deleting}
                >
                  More actions
                </Button>
              }
            >
              <ActionList
                items={[
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
            <Button disabled={saving || deleting}>Edit Profile</Button>
            <Button
              variant="primary"
              onClick={onSave}
              loading={saving}
              disabled={deleting}
            >
              Save Changes
            </Button>
          </InlineStack>
        </InlineStack>
      </BlockStack>
    </Box>
  );
}
