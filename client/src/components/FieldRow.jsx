import { Icon } from '@shopify/polaris';
import PlatformIcon from './PlatformIcon';

export default function FieldRow({
  icon = null,
  label,
  value,
  multiline = false,
  platformIconKey = null,
  muted = false,
}) {
  const valueClass = [
    'crm-field-row__value',
    multiline ? 'crm-field-row__value--multiline' : '',
    platformIconKey ? 'crm-field-row__value--platform' : '',
    muted ? 'crm-field-row__value--muted' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`crm-field-row${multiline ? ' crm-field-row--wrap' : ''}`}>
      <div className="crm-field-row__label">
        {icon ? (
          <span className="crm-field-row__icon" aria-hidden="true">
            <Icon source={icon} />
          </span>
        ) : null}
        <span>{label}</span>
      </div>
      <div className={valueClass}>
        {platformIconKey ? (
          <span className="crm-field-row__platform-icon">
            <PlatformIcon platformKey={platformIconKey} size="summary" withTooltip={false} />
          </span>
        ) : null}
        {value}
      </div>
    </div>
  );
}
