import { Icon } from '@shopify/polaris';

export default function DetailMetricCard({
  label,
  value,
  helpText = '',
  iconSource = null,
  iconBackground = '#EEF2FF',
  iconColor = '#4F46E5',
  compact = false,
}) {
  if (compact) {
    return (
      <div className="crm-detail-kpi-card crm-detail-kpi-card--compact">
        <span className="crm-detail-kpi-card__label">{label}</span>
        <span className="crm-detail-kpi-card__value">{value}</span>
      </div>
    );
  }

  return (
    <div className="crm-detail-kpi-card">
      {iconSource ? (
        <div
          className="crm-detail-kpi-card__icon"
          style={{ background: iconBackground, color: iconColor }}
        >
          <Icon source={iconSource} />
        </div>
      ) : null}
      <div className="crm-detail-kpi-card__body">
        <span className="crm-detail-kpi-card__label">{label}</span>
        <span className="crm-detail-kpi-card__value">{value}</span>
        {helpText ? <span className="crm-detail-kpi-card__help">{helpText}</span> : null}
      </div>
    </div>
  );
}
