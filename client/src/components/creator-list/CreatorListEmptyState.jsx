import { EmptyState } from '@shopify/polaris';
import { useTranslation } from '../../i18n/LanguageContext.jsx';

export default function CreatorListEmptyState({ hasActiveFilters, onClearFilters, onAddCreator, onImport }) {
  const { t } = useTranslation();

  if (hasActiveFilters) {
    return (
      <EmptyState heading={t('dashboard.noMatchHeading')} image="" action={{ content: t('dashboard.clearFilters'), onAction: onClearFilters }}>
        <p>{t('dashboard.noMatchBody')}</p>
      </EmptyState>
    );
  }

  return (
    <EmptyState
      heading={t('creatorList.emptyTitle')}
      image=""
      action={{ content: t('dashboard.addCreator'), onAction: onAddCreator }}
      secondaryAction={{ content: t('creatorList.importCreators'), onAction: onImport }}
    >
      <p>{t('creatorList.emptyDescription')}</p>
    </EmptyState>
  );
}
