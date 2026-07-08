import { Button, Icon, TextField } from '@shopify/polaris';
import { ExternalIcon } from '@shopify/polaris-icons';
import { normalizeExternalUrl, openExternalUrl } from '../constants';

export default function UrlFieldWithOpen({
  label,
  labelHidden = false,
  value,
  onChange,
  disabled = false,
  placeholder,
  autoComplete = 'off',
  variant = 'button',
  className = '',
}) {
  const canOpen = Boolean(normalizeExternalUrl(value));

  const connectedRight =
    variant === 'icon' ? (
      <button
        type="button"
        className="crm-url-field__icon-btn"
        disabled={!canOpen || disabled}
        onClick={() => openExternalUrl(value)}
        aria-label={`Open ${label}`}
      >
        <Icon source={ExternalIcon} tone={canOpen && !disabled ? 'base' : 'subdued'} />
      </button>
    ) : (
      <Button
        disabled={!canOpen || disabled}
        onClick={() => openExternalUrl(value)}
        external
        accessibilityLabel={`Open ${label}`}
      >
        Open ↗
      </Button>
    );

  return (
    <div className={['crm-url-field', variant === 'icon' ? 'crm-url-field--icon' : '', className].filter(Boolean).join(' ')}>
      <TextField
        label={label}
        labelHidden={labelHidden}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        connectedRight={connectedRight}
      />
    </div>
  );
}
