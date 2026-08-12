import PlatformIcon from '../PlatformIcon';
import { useTranslation } from '../../i18n/LanguageContext.jsx';

export default function PlatformSummaryCard({ platforms, connectedPlatformsCount }) {
  const { t } = useTranslation();
  return (
    <section className="crm-add-creator__preview-card crm-platform-summary" aria-labelledby="platform-summary-title">
      <div className="crm-platform-summary__heading"><div><p>{t('creatorCreate.channels')}</p><h2 id="platform-summary-title">{t('creatorCreate.platformSummary')}</h2></div><span>{connectedPlatformsCount} / {platforms.length}</span></div>
      <ul className="crm-platform-summary__list">
        {platforms.map((platform) => <li key={platform.key}><span className="crm-platform-summary__platform"><PlatformIcon platformKey={platform.key} size="summary" withTooltip={false} />{platform.label}</span><span className="crm-platform-summary__metric"><strong>{platform.followerDisplay}</strong><small className={platform.isConnected ? 'crm-platform-summary__state--connected' : ''}>{platform.isConnected ? t('common.connected') : t('common.notConnected')}</small></span></li>)}
      </ul>
    </section>
  );
}
