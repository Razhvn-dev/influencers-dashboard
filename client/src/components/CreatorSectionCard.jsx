import { BlockStack, Box, Button, Card, InlineStack, Text } from '@shopify/polaris';
import { EditIcon } from '@shopify/polaris-icons';

function SectionHeader({ title, editing, onEdit, onDone, headerExtra = null }) {
  return (
    <InlineStack align="space-between" blockAlign="center" wrap gap="300">
      <Text as="h3" variant="headingMd" fontWeight="semibold" className="crm-section-card__title">
        {title}
      </Text>
      <InlineStack gap="300" blockAlign="center" wrap={false}>
        {headerExtra}
        {onEdit || onDone ? (
          <Box className="crm-section-card__edit">
            {editing ? (
              <Button variant="plain" onClick={onDone}>
                Done
              </Button>
            ) : (
              <Button variant="plain" icon={EditIcon} onClick={onEdit}>
                Edit
              </Button>
            )}
          </Box>
        ) : null}
      </InlineStack>
    </InlineStack>
  );
}

export default function CreatorSectionCard({
  title,
  editing = false,
  onEdit,
  onDone,
  readContent,
  editContent,
  padding = '500',
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
            <SectionHeader
              title={title}
              editing={editing}
              onEdit={onEdit}
              onDone={onDone}
            />
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
  onEdit,
  onDone,
  headerExtra = null,
  readContent,
  editContent,
}) {
  return (
    <Box className="crm-section-card">
      <Card padding="0">
        <Box padding="500" paddingBlockEnd="400" className="crm-section-card__header">
          <SectionHeader
            title={title}
            editing={editing}
            onEdit={onEdit}
            onDone={onDone}
            headerExtra={headerExtra}
          />
        </Box>

        <Box className="crm-section-card__body">{editing ? editContent : readContent}</Box>
      </Card>
    </Box>
  );
}
