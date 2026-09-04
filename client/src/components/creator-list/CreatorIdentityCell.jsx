import { creatorHandle, creatorLegalName, creatorPrimaryName, derivePrimaryChannel } from '../../constants';
import { useTranslation } from '../../i18n/LanguageContext.jsx';
import CreatorTableAvatar from '../dashboard/CreatorTableAvatar';

export default function CreatorIdentityCell({ record }) {
  const { t } = useTranslation();
  const category = String(record.niche_category || '').trim() || t('creatorList.uncategorized');
  const primaryChannel = derivePrimaryChannel(record);

  return (
    <div className="crm-resource-identity">
      <CreatorTableAvatar record={record} />
      <div className="crm-resource-identity__body">
        <span className="crm-resource-identity__name">{creatorPrimaryName(record)}</span>
        {creatorLegalName(record) && creatorLegalName(record) !== creatorPrimaryName(record) ? (
          <span className="crm-resource-identity__handle">{creatorLegalName(record)}</span>
        ) : null}
        <span className="crm-resource-identity__handle">{creatorHandle(record)}</span>
        <div className="crm-resource-identity__meta">
          <span>{category}</span>
          {primaryChannel && primaryChannel !== 'Not selected' ? (
            <span>{t('creatorList.primaryPlatform', { platform: primaryChannel })}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
