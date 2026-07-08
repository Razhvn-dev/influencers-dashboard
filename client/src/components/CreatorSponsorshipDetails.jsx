import { Badge, BlockStack, Box, FormLayout, InlineStack, Text, TextField } from '@shopify/polaris';
import CreatorInfoRow from './CreatorInfoRow';
import CreatorSectionCard from './CreatorSectionCard';

function ProductChips({ products }) {
  const items = products
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  if (items.length === 0) {
    return <Text as="p">—</Text>;
  }

  return (
    <InlineStack gap="200" wrap>
      {items.map((item) => (
        <Box key={item} className="crm-product-chip">
          <Badge tone="info">{item}</Badge>
        </Box>
      ))}
    </InlineStack>
  );
}

export default function CreatorSponsorshipDetails({
  form,
  onChange,
  editing = false,
  onEdit,
  onDone,
}) {
  const updateField = (field) => (value) => {
    onChange({ ...form, [field]: value });
  };

  const products = String(form.sponsored_products || '').trim();
  const orders = String(form.order_numbers || '').trim();
  const deliverables = String(form.required_deliverables || '').trim();

  const readContent = (
    <BlockStack gap="500">
      <BlockStack gap="250">
        <Text as="p" variant="bodySm" tone="subdued">
          Sponsored Product(s)
        </Text>
        <ProductChips products={products} />
      </BlockStack>

      <Box className="crm-info-list">
        <CreatorInfoRow label="Order #'s" value={orders} />
      </Box>

      {deliverables ? (
        <Box className="crm-callout-box" padding="500">
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" tone="subdued">
              Required Deliverables
            </Text>
            <Text as="p" variant="bodyMd" whiteSpace="pre-wrap">
              {deliverables}
            </Text>
          </BlockStack>
        </Box>
      ) : (
        <CreatorInfoRow label="Required Deliverables" value="—" />
      )}
    </BlockStack>
  );

  const editContent = (
    <FormLayout>
      <TextField
        label="Sponsored Product(s)"
        value={form.sponsored_products}
        onChange={updateField('sponsored_products')}
        multiline={3}
        autoComplete="off"
      />
      <TextField
        label="Order #'s"
        value={form.order_numbers}
        onChange={updateField('order_numbers')}
        multiline={2}
        autoComplete="off"
      />
      <TextField
        label="Required Deliverables per contract"
        value={form.required_deliverables}
        onChange={updateField('required_deliverables')}
        multiline={3}
        autoComplete="off"
      />
    </FormLayout>
  );

  return (
    <CreatorSectionCard
      title="Sponsorship Details"
      editing={editing}
      onEdit={onEdit}
      onDone={onDone}
      readContent={readContent}
      editContent={editContent}
    />
  );
}
