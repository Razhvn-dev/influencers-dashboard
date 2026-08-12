import { useTranslation } from '../i18n/LanguageContext.jsx';

export default function CreatorDetailSupportingSurface({ children }) {
  const { t } = useTranslation();
  return <aside className="crm-detail-supporting-surface" aria-label={t('creatorDetail.creatorProfile')}>{children}</aside>;
}
