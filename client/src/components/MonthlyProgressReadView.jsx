import { MONTHLY_PERIOD_LABELS, openExternalUrl } from '../constants';
import { useTranslation } from '../i18n/LanguageContext.jsx';

function hasValue(value) {
  return String(value || '').trim().length > 0;
}

export function statusForPeriod(period, t = null) {
  const checkIn = hasValue(period.monthly_check_in);
  const content = hasValue(period.content_delivered);
  const link = hasValue(period.link);

  if (checkIn && content && link) return { label: t ? t('progress.completed') : 'Completed', tone: 'completed' };
  if (checkIn || content || link) return { label: t ? t('progress.inProgress') : 'In progress', tone: 'progress' };
  return { label: t ? t('progress.notStarted') : 'Not started', tone: 'pending' };
}

export function countCompletedPeriods(periods) {
  return periods.filter((period) => statusForPeriod(period).tone === 'completed').length;
}

function dotClass(value) {
  if (!hasValue(value)) return 'crm-detail-progress-dot--empty';
  const normalized = String(value).trim().toUpperCase();
  if (normalized === 'NO' || normalized === 'PENDING') return 'crm-detail-progress-dot--pending';
  return 'crm-detail-progress-dot--done';
}

function ProgressStatusPill({ label, tone }) {
  return <span className={`crm-detail-progress-status crm-detail-progress-status--${tone}`}>{label}</span>;
}

export default function MonthlyProgressReadView({ periods }) {
  const { t } = useTranslation();
  return (
    <div className="crm-detail-progress-table-wrap">
      <table className="crm-detail-progress-table">
        <thead>
          <tr>
            <th>{t('progress.period')}</th>
            <th>{t('progress.checkIn')}</th>
            <th>{t('progress.contentDelivered')}</th>
            <th>{t('progress.link')}</th>
            <th>{t('progress.status')}</th>
          </tr>
        </thead>
        <tbody>
          {periods.map((period) => {
            const checkIn = String(period.monthly_check_in || '').trim();
            const content = String(period.content_delivered || '').trim();
            const link = String(period.link || '').trim();
            const status = statusForPeriod(period, t);

            return (
              <tr key={period.period_index}>
                <td data-label={t('progress.period')}>
                  {MONTHLY_PERIOD_LABELS[period.period_index - 1] || `Period ${period.period_index}`}
                </td>
                <td data-label={t('progress.checkIn')}>
                  <span className="crm-detail-progress-cell">
                    <span className={`crm-detail-progress-dot ${dotClass(checkIn)}`} />
                    {checkIn || t('progress.notStarted')}
                  </span>
                </td>
                <td data-label={t('progress.contentDelivered')}>
                  <span className="crm-detail-progress-cell">
                    <span className={`crm-detail-progress-dot ${dotClass(content)}`} />
                    {content || t('progress.notStarted')}
                  </span>
                </td>
                <td data-label={t('progress.link')}>
                  {link ? (
                    <button
                      type="button"
                      className="crm-open-link"
                      onClick={() => openExternalUrl(link)}
                    >
                      {t('common.openProfile')}
                    </button>
                  ) : (
                    t('common.notSet')
                  )}
                </td>
                <td data-label={t('progress.status')}>
                  <ProgressStatusPill label={status.label} tone={status.tone} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="crm-detail-progress-footnote">
        {t('progress.readHelp')}
      </p>
    </div>
  );
}
