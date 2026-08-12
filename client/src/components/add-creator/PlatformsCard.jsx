import AddCreatorFormCard from './AddCreatorFormCard';
import AddCreatorPlatformTable from './AddCreatorPlatformTable';
import { useTranslation } from '../../i18n/LanguageContext.jsx';

export default function PlatformsCard({ form, onFieldChange, onFollowerFieldChange }) {
  const { t } = useTranslation();

  return (
    <AddCreatorFormCard
      title={t('addCreator.platforms')}
      sectionId="creator-platforms"
      className="crm-add-creator__platforms-card"
    >
      <AddCreatorPlatformTable
        form={form}
        onFieldChange={onFieldChange}
        onFollowerFieldChange={onFollowerFieldChange}
      />
      <p className="crm-platform-connections__footnote">{t('creatorCreate.platformCountsNote')}</p>
    </AddCreatorFormCard>
  );
}
