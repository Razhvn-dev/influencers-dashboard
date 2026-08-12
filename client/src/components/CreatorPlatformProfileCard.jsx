import { Button } from '@shopify/polaris';
import { ExternalSmallIcon } from '@shopify/polaris-icons';
import {
  formatCompactNumber,
  normalizeExternalUrl,
  openExternalUrl,
  parseFollowerCount,
  platformHandleFromUrl,
} from '../constants';
import PlatformIcon from './PlatformIcon';
import { useTranslation } from '../i18n/LanguageContext.jsx';

export default function CreatorPlatformProfileCard({ platform, form, primaryPlatformKey }) {
  const { t } = useTranslation();
  const url = form[platform.key];
  const hasUrl = Boolean(normalizeExternalUrl(url));
  const followerCount = parseFollowerCount(form[platform.followerField]);
  const isConnected = hasUrl || followerCount > 0;
  const isPrimary = primaryPlatformKey === platform.key;
  const handle = hasUrl ? platformHandleFromUrl(url) : t('common.notConnected');

  return (
    <div
      className={`crm-detail-platform-row${isConnected ? ' crm-detail-platform-row--connected' : ' crm-detail-platform-row--disconnected'}${isPrimary ? ' crm-detail-platform-row--primary' : ''}`}
    >
      <div className="crm-detail-platform-row__identity">
        <PlatformIcon platformKey={platform.key} size="medium" withTooltip={false} />
        <div>
          <p className="crm-detail-platform-row__name">
            {platform.label}
            {isPrimary ? (
              <span className="crm-detail-platform-row__primary">{t('common.primary')}</span>
            ) : null}
          </p>
          <p className="crm-detail-platform-row__state">
            {isConnected ? t('common.connected') : t('common.notConnected')}
          </p>
        </div>
      </div>

      <div className="crm-detail-platform-row__profile">
        <span className="crm-detail-platform-row__label">{t('creatorDetail.profile')}</span>
        <strong className="crm-detail-platform-row__handle">{handle}</strong>
      </div>

      <div className="crm-detail-platform-row__followers">
        <span className="crm-detail-platform-row__label">{t('creatorDetail.followers')}</span>
        <strong>{isConnected ? formatCompactNumber(followerCount) : t('common.emptyValue')}</strong>
      </div>

      <div className="crm-detail-platform-row__actions">
        {hasUrl ? (
          <Button
            variant="plain"
            icon={ExternalSmallIcon}
            onClick={() => openExternalUrl(url)}
            accessibilityLabel={t('creatorCreate.openPlatformProfile', { platform: platform.label })}
            className="crm-detail-platform-row__action-btn"
          />
        ) : (
          <span className="crm-detail-platform-row__hint">{t('creatorDetail.addDetailsInEdit')}</span>
        )}
      </div>
    </div>
  );
}
