import { BlockStack, Box, Card, InlineStack, Text } from '@shopify/polaris';

function SectionHeader({ title, headerExtra = null }) {
  return (
    <InlineStack align="space-between" blockAlign="center" wrap gap="300">
      <Text as="h3" variant="headingMd" fontWeight="semibold" className="crm-section-card__title">
        {title}
      </Text>
      {headerExtra ? (
        <InlineStack gap="300" blockAlign="center" wrap={false}>
          {headerExtra}
        </InlineStack>
      ) : null}
    </InlineStack>
  );
}

export default function CreatorSectionCard({
  title,
  editing = false,
  readContent,
  editContent,
  padding = '500',
  headerExtra = null,
}) {
  const isFlush = padding === '0';

  return (
    <Box className="crm-section-card">
      <Card padding={padding}>
        <BlockStack gap={isFlush ? '0' : '500'}>
          <Box
            padding={isFlush ? '500' : undefined}
            paddingBlockEnd={isFlush ? '400' : undefined}
            className={isFlush ? 'crm-section-card__header' : undefined}
          >
            <SectionHeader title={title} headerExtra={headerExtra} />
          </Box>

          <Box
            paddingInline={isFlush ? '500' : undefined}
            paddingBlockEnd={isFlush ? '500' : undefined}
            className="crm-section-card__body"
          >
            {editing ? editContent : readContent}
          </Box>
        </BlockStack>
      </Card>
    </Box>
  );
}

export function CreatorSectionCardShell({
  title,
  editing = false,
  headerExtra = null,
  readContent,
  editContent,
}) {
  return (
    <Box className="crm-section-card">
      <Card padding="0">
        <Box padding="500" paddingBlockEnd="400" className="crm-section-card__header">
          <SectionHeader title={title} headerExtra={headerExtra} />
        </Box>

        <Box className="crm-section-card__body">{editing ? editContent : readContent}</Box>
      </Card>
    </Box>
  );
}
