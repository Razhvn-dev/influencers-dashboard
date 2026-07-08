import { Box, Button, Icon, InlineStack, TextField } from '@shopify/polaris';
import { ExportIcon, PlusIcon, SearchIcon } from '@shopify/polaris-icons';

export default function DashboardPageHeader({
  search,
  onSearchChange,
  onExport,
  exportDisabled,
  onAddCreator,
}) {
  return (
    <Box className="crm-v2-header">
      <InlineStack align="space-between" blockAlign="center" wrap={false}>
        <h1 className="crm-v2-header__title">Influencer Dashboard</h1>

        <InlineStack gap="300" wrap={false} blockAlign="center" className="crm-v2-header__actions">
          <Box className="crm-v2-header__search">
            <TextField
              label="Search creators"
              labelHidden
              value={search}
              onChange={onSearchChange}
              placeholder="Search creators..."
              autoComplete="off"
              prefix={<Icon source={SearchIcon} tone="subdued" />}
              clearButton
              onClearButtonClick={() => onSearchChange('')}
            />
          </Box>
          <Button
            icon={ExportIcon}
            onClick={onExport}
            disabled={exportDisabled}
            className="crm-v2-header__export-btn"
          >
            Export Excel
          </Button>
          <Button
            icon={PlusIcon}
            variant="primary"
            onClick={onAddCreator}
            className="crm-v2-header__add-btn"
          >
            Add Creator
          </Button>
        </InlineStack>
      </InlineStack>
    </Box>
  );
}
