import { BlockStack, Box, Divider, FormLayout, Text, TextField } from '@shopify/polaris';
import CreatorInfoRow from './CreatorInfoRow';
import CreatorSectionCard from './CreatorSectionCard';

export default function CreatorProfilePanel({
  form,
  onChange,
  editing = false,
  onEdit,
  onDone,
}) {
  const updateField = (field) => (value) => {
    onChange({ ...form, [field]: value });
  };

  const readContent = (
    <BlockStack gap="500">
      <Text as="p" variant="headingMd" fontWeight="semibold">
        {form.name || '—'}
      </Text>
      <Divider />
      <Box className="crm-info-list">
        <CreatorInfoRow label="Email" value={form.email} />
        <CreatorInfoRow label="Location" value={form.region} />
        <CreatorInfoRow label="Channel / Brand" value={form.channel} />
        <CreatorInfoRow label="Affiliate Code" value={form.affiliate_code} />
      </Box>
    </BlockStack>
  );

  const editContent = (
    <FormLayout>
      <TextField
        label="Full Name"
        value={form.name}
        onChange={updateField('name')}
        autoComplete="name"
        requiredIndicator
      />
      <TextField
        label="Email"
        type="email"
        value={form.email}
        onChange={updateField('email')}
        autoComplete="email"
      />
      <TextField
        label="Location"
        value={form.region}
        onChange={updateField('region')}
        placeholder="e.g. US"
        autoComplete="off"
      />
      <TextField
        label="Channel / Brand"
        value={form.channel}
        onChange={updateField('channel')}
        autoComplete="off"
      />
      <TextField
        label="Affiliate Code"
        value={form.affiliate_code}
        onChange={updateField('affiliate_code')}
        autoComplete="off"
      />
    </FormLayout>
  );

  return (
    <CreatorSectionCard
      title="Creator Profile"
      editing={editing}
      onEdit={onEdit}
      onDone={onDone}
      readContent={readContent}
      editContent={editContent}
    />
  );
}
