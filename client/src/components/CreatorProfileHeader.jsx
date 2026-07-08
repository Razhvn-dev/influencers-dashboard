import {
  Avatar,
  Badge,
  BlockStack,
  Box,
  Button,
  InlineStack,
  Text,
} from '@shopify/polaris';
import {
  creatorHandle,
  creatorTagline,
  displayAmbassadorLevel,
  getCreatorInitials,
  levelTone,
  statusTone,
} from '../constants';

export default function CreatorProfileHeader({
  form,
  ambassadorLevel,
  onClose,
}) {
  const profileRecord = {
    ...form,
    channel: form.channel,
    sponsored_products: form.sponsored_products,
    youtube_url: form.youtube_url,
    instagram_url: form.instagram_url,
    facebook_url: form.facebook_url,
    tiktok_url: form.tiktok_url,
  };

  const tagline = creatorTagline(profileRecord, 56);

  return (
    <Box className="crm-detail-header">
      <BlockStack gap="600">
        <Button variant="plain" onClick={onClose} className="crm-back-link">
          ← Back to Dashboard
        </Button>

        <InlineStack align="space-between" blockAlign="start" wrap gap="500">
          <InlineStack gap="500" blockAlign="center" wrap={false}>
            <Avatar
              customer
              size="xl"
              name={form.name}
              initials={getCreatorInitials(form.name)}
            />
            <BlockStack gap="250">
              <InlineStack gap="300" blockAlign="center" wrap>
                <Text as="h2" variant="headingXl" fontWeight="bold">
                  {form.name || 'Creator'}
                </Text>
                <Text as="span" variant="bodyMd" tone="subdued">
                  {creatorHandle(profileRecord)}
                </Text>
              </InlineStack>
              {tagline !== '—' ? (
                <Box maxWidth="fit-content">
                  <Badge tone="info">{tagline}</Badge>
                </Box>
              ) : null}
            </BlockStack>
          </InlineStack>

          <InlineStack gap="200" wrap className="crm-detail-header__badges">
            {form.status ? (
              <Badge tone={statusTone(form.status)}>{form.status}</Badge>
            ) : null}
            <Badge tone={levelTone(ambassadorLevel)}>
              {displayAmbassadorLevel(ambassadorLevel)}
            </Badge>
          </InlineStack>
        </InlineStack>
      </BlockStack>
    </Box>
  );
}
