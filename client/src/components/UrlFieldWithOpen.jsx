import { Button, TextField } from '@shopify/polaris';
import { normalizeExternalUrl, openExternalUrl } from '../constants';

export default function UrlFieldWithOpen({
  label,
  labelHidden = false,
  value,
  onChange,
  disabled = false,
  placeholder,
  autoComplete = 'off',
}) {
  const canOpen = Boolean(normalizeExternalUrl(value));

  return (
    <TextField
      label={label}
      labelHidden={labelHidden}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete={autoComplete}
      disabled={disabled}
      connectedRight={
        <Button
          disabled={!canOpen || disabled}
          onClick={() => openExternalUrl(value)}
          external
          accessibilityLabel={`Open ${label}`}
        >
          Open
        </Button>
      }
    />
  );
}
