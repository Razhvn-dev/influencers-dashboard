import { FormLayout, Select, TextField } from '@shopify/polaris';
import { getTranslatedManagerOwnerOptions } from '../constants';
import CreatorSectionCard from './CreatorSectionCard';
import CreatorProfileSummary from './CreatorProfileSummary';
import { useTranslation } from '../i18n/LanguageContext.jsx';

export default function CreatorProfilePanel({
  form,
  record,
  onChange,
  editing = false,
  embedded = false,
  onEditRequest = null,
}) {
  const { t } = useTranslation();
  const updateField = (field) => (value) => {
    onChange({ ...form, [field]: value });
  };

  const readContent = <CreatorProfileSummary form={form} record={record} />;

  const editContent = (
    <FormLayout>
      <TextField
        label={t('creatorDetail.fullName')}
        value={form.name}
        onChange={updateField('name')}
        autoComplete="name"
        requiredIndicator
      />
      <TextField
        label={t('creatorDetail.email')}
        type="email"
        value={form.email}
        onChange={updateField('email')}
        autoComplete="email"
      />
      <TextField
        label={t('creatorDetail.location')}
        value={form.region}
        onChange={updateField('region')}
        placeholder={t('creatorCreate.regionPlaceholder')}
        autoComplete="off"
      />
      <TextField
        label={t('creatorDetail.channelBrand')}
        value={form.channel}
        onChange={updateField('channel')}
        autoComplete="off"
      />
      <TextField
        label={t('creatorDetail.categoryField')}
        value={form.niche_category}
        onChange={updateField('niche_category')}
        autoComplete="off"
      />
      <TextField
        label={t('creatorDetail.bio')}
        value={form.bio}
        onChange={updateField('bio')}
        multiline={3}
        autoComplete="off"
      />
      <Select
        label={t('creatorDetail.owner')}
        options={getTranslatedManagerOwnerOptions(t)}
        value={form.manager_owner}
        onChange={updateField('manager_owner')}
      />
      <TextField
        label={t('creatorDetail.tags')}
        value={form.tags}
        onChange={updateField('tags')}
        placeholder={t('creatorCreate.tagsPlaceholder')}
        autoComplete="off"
      />
      <TextField
        label={t('creatorDetail.affiliateCode')}
        value={form.affiliate_code}
        onChange={updateField('affiliate_code')}
        autoComplete="off"
      />
    </FormLayout>
  );

  if (embedded && !editing) {
    return (
      <section className="crm-detail-supporting-section crm-detail-supporting-section--profile">
        <div className="crm-detail-supporting-section__head">
          <h2>{t('creatorDetail.creatorProfile')}</h2>
          {onEditRequest ? (
            <button type="button" className="crm-detail-inline-action" onClick={onEditRequest}>
              {t('common.edit')}
            </button>
          ) : null}
        </div>
        {readContent}
      </section>
    );
  }

  return (
    <CreatorSectionCard
      title={t('creatorDetail.creatorProfile')}
      editing={editing}
      readContent={readContent}
      editContent={editContent}
    />
  );
}
