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
        <TextField
          label={t('creatorCreate.businessChannelName')}
          value={form.business_name}
          onChange={onFieldChange('business_name')}
          placeholder={t('creatorCreate.businessChannelNamePlaceholder')}
          autoComplete="organization"
          requiredIndicator
          error={nameError || undefined}
        />
        <FormLayout.Group>
          <TextField
            label={t('creatorCreate.firstName')}
            value={form.first_name}
            onChange={onFieldChange('first_name')}
            placeholder={t('creatorCreate.firstNamePlaceholder')}
            autoComplete="given-name"
            requiredIndicator
            error={nameError || undefined}
          />
          <TextField
            label={t('creatorCreate.lastName')}
            value={form.last_name}
            onChange={onFieldChange('last_name')}
            placeholder={t('creatorCreate.lastNamePlaceholder')}
            autoComplete="family-name"
          />
        </FormLayout.Group>
        <FormLayout.Group>
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
