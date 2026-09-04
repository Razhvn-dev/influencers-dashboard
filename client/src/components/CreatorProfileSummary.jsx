import { creatorHandle, creatorLegalName, formatFollowupDate } from '../constants';
import { useTranslation } from '../i18n/LanguageContext.jsx';

function hasValue(value) {
  return Boolean(String(value ?? '').trim());
}

function resolveProfileHandle(form) {
  const channel = String(form.channel || '').trim();
  const platformHandle = creatorHandle({ ...form, channel: '' });
  if (platformHandle && platformHandle.startsWith('@')) {
    return platformHandle;
  }

  const nameHandle = String(form.name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');

  if (nameHandle) {
    return `@${nameHandle}`;
  }

  const raw = creatorHandle(form);
  if (raw && raw.startsWith('@')) {
    return raw;
  }

  return null;
}

function splitChannelDisplay(form) {
  const rawChannel = String(form.channel || '').trim();
  const handle = resolveProfileHandle(form);

  if (!rawChannel) {
    return { brand: null, handle };
  }

  if (rawChannel.startsWith('@')) {
    return { brand: null, handle: rawChannel };
  }

  const atIndex = rawChannel.indexOf('@');
  if (atIndex > 0) {
    const brand = rawChannel.slice(0, atIndex).replace(/[/\s]+$/, '').trim();
    const inlineHandle = rawChannel.slice(atIndex).trim();
    return { brand: brand || null, handle: inlineHandle || handle };
  }

  const normalizedBrand = rawChannel.toLowerCase();
  const normalizedHandle = handle ? handle.replace('@', '').toLowerCase() : '';
  const isDuplicate =
    !handle ||
    handle === rawChannel ||
    normalizedHandle === normalizedBrand.replace(/\s+/g, '');

  return {
    brand: rawChannel,
    handle: isDuplicate ? null : handle,
  };
}

export default function CreatorProfileSummary({ form, record }) {
  const { t } = useTranslation();
  const { brand } = splitChannelDisplay(form);
  const legalName = creatorLegalName(form);
  const niche = String(form.niche_category || '').trim();

  const details = [
    form.business_name ? { label: t('creatorCreate.businessChannelName'), value: form.business_name } : null,
    legalName ? { label: `${t('creatorCreate.firstName')} / ${t('creatorCreate.lastName')}`, value: legalName } : null,
    brand ? { label: t('creatorDetail.channelBrand'), value: brand } : null,
    niche ? { label: t('creatorDetail.categoryField'), value: niche } : null,
    hasValue(form.email) ? { label: t('creatorDetail.email'), value: form.email } : null,
    hasValue(form.manager_owner) ? { label: t('creatorDetail.owner'), value: form.manager_owner } : null,
    hasValue(form.tags) ? { label: t('creatorDetail.tags'), value: form.tags } : null,
    record?.created_at
      ? { label: t('creatorDetail.joinedDate'), value: formatFollowupDate(record.created_at) }
      : null,
  ].filter(Boolean);

  const hasBio = hasValue(form.bio);
  const isSparse = details.length === 0 && !hasBio;

  if (isSparse) {
    return (
      <div className="crm-detail-supporting-profile crm-detail-supporting-profile--sparse">
        <p className="crm-detail-empty-state">{t('creatorDetail.profileSparseHint')}</p>
      </div>
    );
  }

  return (
    <div className="crm-detail-supporting-profile">
      <dl className="crm-detail-supporting-fields">
        {details.map((detail) => (
          <div key={detail.label} className="crm-detail-supporting-fields__item">
            <dt>{detail.label}</dt>
            <dd>{detail.value}</dd>
          </div>
        ))}
        {hasBio ? (
          <div className="crm-detail-supporting-fields__item crm-detail-supporting-fields__item--stacked">
            <dt>{t('creatorDetail.bio')}</dt>
            <dd>{form.bio}</dd>
          </div>
        ) : (
          <div className="crm-detail-supporting-fields__item crm-detail-supporting-fields__item--stacked">
            <dt>{t('creatorDetail.bio')}</dt>
            <dd className="crm-detail-supporting-fields__empty">{t('creatorDetail.noBioYet')}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
