import { useTranslation } from '../../i18n/LanguageContext.jsx';
import DashboardPageHeader from '../DashboardPageHeader';

export default function CreatorListHeader(props) {
  const { t } = useTranslation();

  return (
    <header className="crm-creator-list__header">
      <DashboardPageHeader
        {...props}
        title={t('creatorList.title')}
        description={t('creatorList.description')}
        showSearch={false}
      />
    </header>
  );
}
