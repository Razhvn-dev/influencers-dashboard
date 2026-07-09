import { useMemo } from 'react';
import {
  Avatar,
  BlockStack,
  Box,
  Button,
  Icon,
  InlineStack,
  Text,
} from '@shopify/polaris';
import { ArrowLeftIcon } from '@shopify/polaris-icons';
import {
  creatorHandle,
  getCreatorInitials,
} from '../constants';
import LevelBadge from './dashboard/LevelBadge';
import StatusBadge from './dashboard/StatusBadge';

function displayHandle(record) {
  const handle = creatorHandle(record);
  if (handle && handle !== '-') {
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

  return nameHandle ? `@${nameHandle}` : '-';
}

export default function CreatorProfileHeader({
  form,
  ambassadorLevel,
  onBack,
  onStartEdit,
  onDelete,
  isEditing = false,
  saving = false,
  deleting = false,
  metrics = null,
}) {
  const profileRecord = useMemo(
    () => ({
      ...form,
      channel: form.channel,
    }),
    [form]
  );

  const handle = displayHandle(profileRecord);

  return (
    <Box className="crm-detail-header">
      <InlineStack align="space-between" blockAlign="center" gap="400" wrap>
        <button type="button" className="crm-detail-back" onClick={onBack}>
          <Icon source={ArrowLeftIcon} />
          Back to dashboard
        </button>
        {!isEditing ? (
          <InlineStack gap="300" wrap={false} blockAlign="center" className="crm-detail-header__actions">
            <Button
              variant="secondary"
              tone="critical"
              onClick={onDelete}
              disabled={saving || deleting}
              loading={deleting}
            >
              Delete
            </Button>
            <Button variant="primary" onClick={onStartEdit} disabled={saving || deleting}>
              Edit creator
            </Button>
          </InlineStack>
        ) : null}
      </InlineStack>

      <Box className="crm-detail-header__identity-row">
        <InlineStack gap="500" blockAlign="start" wrap={false}>
          <Box className="crm-detail-header__avatar">
            <Avatar customer size="xl" name={form.name} initials={getCreatorInitials(form.name)} />
          </Box>

          <BlockStack gap="0" className="crm-detail-header__identity-text">
            <Text
              as="h1"
              variant="heading2xl"
              fontWeight="semibold"
              className="crm-detail-header__name"
            >
              {form.name || 'Creator'}
            </Text>

            <Text as="p" variant="bodyMd" tone="subdued" className="crm-detail-header__handle">
              {handle}
            </Text>

            <InlineStack gap="200" wrap className="crm-detail-header__badges">
              {form.status ? <StatusBadge status={form.status} /> : null}
              {ambassadorLevel ? <LevelBadge level={ambassadorLevel} /> : null}
            </InlineStack>
          </BlockStack>
        </InlineStack>
      </Box>

      {metrics ? (
        <Box className="crm-detail-header__metrics-row">{metrics}</Box>
      ) : null}
    </Box>
  );
}
