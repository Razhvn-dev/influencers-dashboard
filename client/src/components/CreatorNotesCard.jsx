import { BlockStack, Box, Button, Text, TextField } from '@shopify/polaris';
import { EditIcon } from '@shopify/polaris-icons';
import CreatorSectionCard from './CreatorSectionCard';

export default function CreatorNotesCard({
  form,
  onChange,
  editing = false,
  onEdit,
  onDone,
}) {
  const updateField = (field) => (value) => {
    onChange({ ...form, [field]: value });
  };

  const notes = String(form.notes || '').trim();

  const readContent = notes ? (
    <Box className="crm-note-timeline">
      <span className="crm-note-timeline__line" aria-hidden="true" />
      <Box className="crm-note-entry" padding="500">
        <BlockStack gap="300">
          <Text as="p" variant="bodySm" tone="subdued" fontWeight="medium">
            Latest activity
          </Text>
          <Text as="p" variant="bodyMd" whiteSpace="pre-wrap">
            {notes}
          </Text>
        </BlockStack>
      </Box>
    </Box>
  ) : (
    <Box className="crm-empty-note" padding="600">
      <BlockStack gap="300" inlineAlign="center">
        <Text as="p" tone="subdued" variant="bodyMd" alignment="center">
          No notes yet
        </Text>
        <Button icon={EditIcon} onClick={onEdit}>
          Add Note
        </Button>
      </BlockStack>
    </Box>
  );

  const editContent = (
    <TextField
      label="Notes"
      value={form.notes}
      onChange={updateField('notes')}
      multiline={6}
      autoComplete="off"
      helpText="Outreach notes and communication history"
    />
  );

  return (
    <CreatorSectionCard
      title="Notes & History"
      editing={editing}
      onEdit={onEdit}
      onDone={onDone}
      readContent={readContent}
      editContent={editContent}
    />
  );
}
