import { BlockStack, Box, Button, InlineStack, Text, TextField } from '@shopify/polaris';
import { ExportIcon, PlusIcon } from '@shopify/polaris-icons';

export default function DashboardPageHeader({
  search,
  onSearchChange,
  onExport,
  exportDisabled,
  onImport,
  onAddCreator,
}) {
  return (
    <Box className="crm-page-header">
      <InlineStack align="space-between" blockAlign="start" wrap={false} gap="600">
        <BlockStack gap="150">
          <Text as="h1" variant="headingLg">
            Influencer Dashboard
          </Text>
          <Text as="p" variant="bodyMd" tone="subdued">
            Manage your influencer and ambassador relationships
          </Text>
        </BlockStack>

        <InlineStack gap="300" wrap blockAlign="center">
          <Box minWidth="280px" width="100%" maxWidth="360px">
            <TextField
              label="Search creators"
              labelHidden
              value={search}
              onChange={onSearchChange}
              placeholder="Search creators..."
              autoComplete="off"
              clearButton
              onClearButtonClick={() => onSearchChange('')}
            />
          </Box>
          <InlineStack gap="200" wrap={false}>
            <Button onClick={onImport}>Import CSV</Button>
            <Button icon={ExportIcon} onClick={onExport} disabled={exportDisabled}>
              Export Excel
            </Button>
            <Button icon={PlusIcon} variant="primary" onClick={onAddCreator}>
              Add Creator
            </Button>
          </InlineStack>
        </InlineStack>
      </InlineStack>
    </Box>
  );
}
