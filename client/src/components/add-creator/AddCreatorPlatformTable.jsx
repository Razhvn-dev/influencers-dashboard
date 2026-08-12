import { Icon, TextField } from '@shopify/polaris';
import { ExternalIcon } from '@shopify/polaris-icons';
import { normalizeExternalUrl, openExternalUrl, PLATFORM_META } from '../../constants';
import PlatformIcon from '../PlatformIcon';
import { useTranslation } from '../../i18n/LanguageContext.jsx';

function PlatformOpenButton({ url, label }) {
  const canOpen = Boolean(normalizeExternalUrl(url));

  return (
    <button
      type="button"
      className="crm-url-field__icon-btn crm-add-creator__platform-open-btn"
      disabled={!canOpen}
      onClick={() => openExternalUrl(url)}
      aria-label={`Open ${label}`}
    >
      <Icon source={ExternalIcon} tone={canOpen ? 'base' : 'subdued'} />
    </button>
  );
}

function PlatformRow({ platform, form, onFieldChange, onFollowerFieldChange }) {
  const urlValue = form[platform.key] ?? '';
  const followerValue = form[platform.followerField] ?? '';
  const isConnected = Boolean(normalizeExternalUrl(urlValue) || String(followerValue).trim());

  return (
    <tr
      className={`crm-add-creator__platform-row${isConnected ? ' crm-add-creator__platform-row--connected' : ''}`}
    >
      <td className="crm-add-creator__platform-cell crm-add-creator__platform-cell--name">
        <div className="crm-add-creator__platform-label">
          <PlatformIcon platformKey={platform.key} size="small" withTooltip={false} />
          <span>{platform.label}</span>
        </div>
      </td>
      <td className="crm-add-creator__platform-cell">
        <TextField
          label={`${platform.label} URL`}
          labelHidden
          value={urlValue}
          onChange={onFieldChange(platform.key)}
          placeholder={`${platform.label.toLowerCase()}.com/...`}
          autoComplete="off"
        />
      </td>
      <td className="crm-add-creator__platform-cell crm-add-creator__platform-cell--open">
        <PlatformOpenButton url={urlValue} label={platform.label} />
      </td>
      <td className="crm-add-creator__platform-cell crm-add-creator__platform-cell--followers">
        <TextField
          label={`${platform.label} followers`}
          labelHidden
          placeholder="0"
          inputMode="numeric"
          value={followerValue}
          autoComplete="off"
          onChange={onFollowerFieldChange(platform.followerField)}
        />
      </td>
    </tr>
  );
}

export default function AddCreatorPlatformTable({
  form,
  onFieldChange,
  onFollowerFieldChange,
}) {
  const { t } = useTranslation();

  return (
    <div className="crm-add-creator__platform-table-wrap">
      <table className="crm-add-creator__platform-table">
        <thead>
          <tr>
            <th>{t('addCreator.platforms')}</th>
            <th>{t('creatorCreate.profileUrl')}</th>
            <th aria-label="Open" />
            <th>{t('creatorCreate.followers')}</th>
          </tr>
        </thead>
        <tbody>
          {PLATFORM_META.map((platform) => (
            <PlatformRow
              key={platform.key}
              platform={platform}
              form={form}
              onFieldChange={onFieldChange}
              onFollowerFieldChange={onFollowerFieldChange}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
