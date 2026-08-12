import { FormLayout, Select, TextField } from '@shopify/polaris';
import { getTranslatedCommissionOptions } from '../constants';
import CreatorSectionCard from './CreatorSectionCard';
import CreatorPartnershipSection from './CreatorPartnershipSection';
import { useTranslation } from '../i18n/LanguageContext.jsx';

export default function CreatorSponsorshipDetails({
  form,
  onChange,
  editing = false,
  embedded = false,
}) {
  const { t } = useTranslation();
  const updateField = (field) => (value) => {
    onChange({ ...form, [field]: value });
  };

  const readContent = <CreatorPartnershipSection form={form} />;

  const editContent = (
    <FormLayout>
      <TextField
        label={t('creatorDetail.sponsoredProducts')}
        value={form.sponsored_products}
        onChange={updateField('sponsored_products')}
        multiline={3}
        autoComplete="off"
      />
      <TextField
        label={t('creatorDetail.orderNumbers')}
        value={form.order_numbers}
        onChange={updateField('order_numbers')}
        multiline={2}
        autoComplete="off"
      />
      <TextField
        label={t('creatorCreate.requiredDeliverables')}
        value={form.required_deliverables}
        onChange={updateField('required_deliverables')}
        multiline={3}
        autoComplete="off"
      />
      <Select
        label={t('creatorCreate.commission')}
        options={getTranslatedCommissionOptions(t)}
        value={form.commission}
        onChange={updateField('commission')}
      />
      <TextField
        label={t('creatorDetail.contract')}
        value={form.contract_status}
        onChange={updateField('contract_status')}
        autoComplete="off"
        placeholder={t('creatorDetail.contractPlaceholder')}
      />
    </FormLayout>
  );

  if (embedded && !editing) return <section className="crm-detail-partnership-surface"><div className="crm-detail-view-section__header"><h2>{t('creatorDetail.partnership')}</h2></div>{readContent}</section>;
  return (
    <CreatorSectionCard
      title={t('creatorDetail.partnership')}
      editing={editing}
      readContent={readContent}
      editContent={editContent}
    />
  );
}
