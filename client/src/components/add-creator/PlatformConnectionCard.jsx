import { Button, TextField } from '@shopify/polaris';
import { ExternalIcon } from '@shopify/polaris-icons';
import { normalizeExternalUrl, openExternalUrl } from '../../constants';
import PlatformIcon from '../PlatformIcon';
import { useTranslation } from '../../i18n/LanguageContext.jsx';

export default function PlatformConnectionCard({
  platform,
  form,
  onFieldChange,
  onFollowerFieldChange,
}) {
  const { t } = useTranslation();
  const urlValue = form[platform.key] ?? '';
  const followerValue = form[platform.followerField] ?? '';
  const canOpen = Boolean(normalizeExternalUrl(urlValue));
  const isConnected = Boolean(canOpen || String(followerValue).trim());

  return (
    <section
      className={`crm-platform-connection-card${isConnected ? ' crm-platform-connection-card--connected' : ''}`}
      aria-labelledby={`platform-${platform.key}-title`}
    >
      <div className="crm-platform-connection-card__header">
        <span className="crm-platform-connection-card__icon" aria-hidden="true">
          <PlatformIcon platformKey={platform.key} size="small" withTooltip={false} />
        </span>
        <div className="crm-platform-connection-card__heading">
          <h3 id={`platform-${platform.key}-title`}>{platform.label}</h3>
          <p>{isConnected ? t('creatorCreate.channelDetailsAdded') : t('creatorCreate.addChannelDetails')}</p>
        </div>
        <span className={`crm-platform-connection-card__status${isConnected ? ' crm-platform-connection-card__status--connected' : ''}`}>
          {isConnected ? t('common.connected') : t('common.notConnected')}
        </span>
      </div>

      <div className="crm-platform-connection-card__fields">
        <div className="crm-platform-connection-card__url-field">
          <TextField
            label={t('creatorCreate.profileUrl')}
            value={urlValue}
            onChange={onFieldChange(platform.key)}
            placeholder={`${platform.label.toLowerCase()}.com/...`}
            autoComplete="off"
          />
          <Button
            icon={ExternalIcon}
            variant="tertiary"
            disabled={!canOpen}
            onClick={() => openExternalUrl(urlValue)}
            accessibilityLabel={t('creatorCreate.openPlatformProfile', { platform: platform.label })}
          />
        </div>
        <TextField
          label={t('creatorCreate.followers')}
          placeholder="0"
          inputMode="numeric"
          value={followerValue}
          autoComplete="off"
          onChange={onFollowerFieldChange(platform.followerField)}
        />
      </div>
    </section>
  );
}
