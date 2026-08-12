import { useTranslation } from '../i18n/LanguageContext.jsx';

function display(value, t) {
  const text = String(value ?? '').trim();
  return text || t('common.notSet');
}

function formatCommission(value, t) {
  const text = String(value ?? '').trim();
  if (!text) return '';
  if (text === 'YES') return t('common.yes');
  if (text === 'NO') return t('common.no');
  return text;
}

function PartnershipDetail({ label, value, multiline = false, fullWidth = false, callout = false }) {
  const text = String(value ?? '').trim();
  if (!text) return null;

  return (
    <div
      className={`crm-detail-partnership__detail${multiline ? ' crm-detail-partnership__detail--multiline' : ''}${fullWidth ? ' crm-detail-partnership__detail--full' : ''}${callout ? ' crm-detail-partnership__detail--callout' : ''}`}
    >
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function CreatorPartnershipSection({ form }) {
  const { t } = useTranslation();
  const sponsoredProduct = String(form.sponsored_products ?? '').trim();
  const deliverables = String(form.required_deliverables ?? '').trim();

  const details = [
    {
      label: t('creatorDetail.contractStatus'),
      value: display(form.contract_status, t),
    },
    {
      label: t('creatorDetail.sponsoredProducts'),
      value: sponsoredProduct || t('creatorDetail.noSponsoredProduct'),
    },
    { label: t('creatorCreate.commission'), value: formatCommission(form.commission, t) },
    { label: t('creatorDetail.affiliateCode'), value: form.affiliate_code },
    { label: t('creatorDetail.orderNumber'), value: form.order_numbers, multiline: true },
  ].filter((item) => Boolean(String(item.value ?? '').trim()));

  return (
    <section className="crm-detail-partnership" aria-label={t('creatorDetail.partnershipSummary')}>
      <dl className="crm-detail-partnership__grid">
        {details.map((item) => (
          <PartnershipDetail key={item.label} {...item} />
        ))}
        {deliverables ? (
          <PartnershipDetail
            label={t('creatorDetail.requiredDeliverables')}
            value={deliverables}
            multiline
            fullWidth
            callout
          />
        ) : null}
      </dl>
      {!details.length && !deliverables ? (
        <p className="crm-detail-partnership__empty">{t('creatorDetail.noCommercialDetails')}</p>
      ) : null}
    </section>
  );
}
