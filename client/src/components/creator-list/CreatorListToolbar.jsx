import DashboardFilterBar from '../DashboardFilterBar';
import { useTranslation } from '../../i18n/LanguageContext.jsx';

export default function CreatorListToolbar(props) {
  const { t } = useTranslation();
  return (
    <section className="crm-creator-list__toolbar" aria-label={t('filters.title')}>
      <DashboardFilterBar {...props} />
    </section>
  );
}
