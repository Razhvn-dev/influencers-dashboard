import { FormLayout, TextField } from '@shopify/polaris';
import AddCreatorFormCard from './AddCreatorFormCard';
import { useTranslation } from '../../i18n/LanguageContext.jsx';

export default function BasicInformationCard({ form, onFieldChange, nameError = '' }) {
  const { t } = useTranslation();

  return (
    <AddCreatorFormCard
      title={t('addCreator.basicInfo')}
      sectionId="creator-profile"
      className="crm-add-creator__basic-card"
    >
      <FormLayout>
        <FormLayout.Group>
          <TextField
            label={t('creatorCreate.creatorName')}
            value={form.name}
            onChange={onFieldChange('name')}
            placeholder={t('creatorCreate.creatorNamePlaceholder')}
            autoComplete="name"
            requiredIndicator
            error={nameError || undefined}
          />
          <TextField
            label={t('creatorCreate.usernameHandle')}
            value={form.channel}
            onChange={onFieldChange('channel')}
            placeholder={t('creatorCreate.handlePlaceholder')}
            autoComplete="off"
          />
        </FormLayout.Group>
        <TextField
          label={t('creatorCreate.category')}
          value={form.niche_category}
          onChange={onFieldChange('niche_category')}
          placeholder={t('creatorCreate.categoryPlaceholder')}
          autoComplete="off"
        />
        <TextField
          label={t('creatorCreate.bio')}
          value={form.bio}
          onChange={onFieldChange('bio')}
          multiline={2}
          placeholder={t('creatorCreate.bioPlaceholder')}
          autoComplete="off"
        />
      </FormLayout>
    </AddCreatorFormCard>
  );
}
