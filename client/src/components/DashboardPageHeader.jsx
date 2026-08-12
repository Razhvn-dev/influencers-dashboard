import { Box, Button, Icon, InlineStack, TextField } from '@shopify/polaris';
import { ExportIcon, PlusIcon, RefreshIcon, SearchIcon } from '@shopify/polaris-icons';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from '../i18n/LanguageContext.jsx';

export default function DashboardPageHeader({
  title,
  description,
  search,
  onSearchChange,
  onExport,
  exportDisabled,
  onAddCreator,
  onRefresh,
  refreshing = false,
  showSearch = true,
}) {
  const { t } = useTranslation();

  return (
    <Box className="crm-v2-header">
      <InlineStack align="space-between" blockAlign="center" wrap={false}>
        <div className="crm-v2-header__copy">
          <h1 className="crm-v2-header__title">{title || t('dashboard.title')}</h1>
          {description ? <p className="crm-v2-header__description">{description}</p> : null}
        </div>

        <div className="crm-v2-header__actions">
        <InlineStack gap="300" wrap={false} blockAlign="center">
          <LanguageSwitcher className="crm-language-switcher" />
          {showSearch ? <Box className="crm-v2-header__search">
            <TextField
              label={t('dashboard.searchPlaceholder')}
              labelHidden
              value={search}
              onChange={onSearchChange}
              placeholder={t('dashboard.searchPlaceholder')}
              autoComplete="off"
              prefix={<Icon source={SearchIcon} tone="subdued" />}
              clearButton
              onClearButtonClick={() => onSearchChange('')}
            />
          </Box> : null}
          <Button
            icon={RefreshIcon}
            onClick={onRefresh}
            loading={refreshing}
            disabled={refreshing}
            accessibilityLabel={t('dashboard.refresh')}
            className="crm-v2-header__refresh-btn"
          />
          <Button
            icon={ExportIcon}
            onClick={onExport}
            disabled={exportDisabled}
            className="crm-v2-header__export-btn"
          >
            {t('dashboard.exportExcel')}
          </Button>
          <Button
            icon={PlusIcon}
            variant="primary"
            onClick={onAddCreator}
            className="crm-v2-header__add-btn"
          >
            {t('dashboard.addCreator')}
          </Button>
        </InlineStack>
        </div>
      </InlineStack>
    </Box>
  );
}
