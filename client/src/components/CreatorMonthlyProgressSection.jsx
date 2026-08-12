import { useEffect, useState } from 'react';
import { Box, Icon } from '@shopify/polaris';
import { CheckCircleIcon } from '@shopify/polaris-icons';
import CreatorSectionCard from './CreatorSectionCard';
import MonthlyProgressEditor from './MonthlyProgressEditor';
import MonthlyProgressReadView, { countCompletedPeriods } from './MonthlyProgressReadView';
import { useTranslation } from '../i18n/LanguageContext.jsx';

export default function CreatorMonthlyProgressSection({
  periods,
  onChange,
  editing = false,
  embedded = false,
}) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(editing);

  useEffect(() => {
    if (editing) {
      setExpanded(true);
    }
  }, [editing]);

  const completed = countCompletedPeriods(periods);
  const total = periods.length || 1;
  const progressPercent = Math.round((completed / total) * 100);
  const summary = t('creatorDetail.periodsComplete', { completed, total: periods.length });

  const readContent = (
    <div className={`crm-detail-progress${expanded ? '' : ' crm-detail-progress--collapsed'}`}>
      <div className="crm-detail-progress-summary">
        <div className="crm-detail-progress-summary__main">
          <div className="crm-detail-progress-summary__stats">
            <span className="crm-detail-progress-summary__icon" aria-hidden="true">
              <Icon source={CheckCircleIcon} />
            </span>
            <span className="crm-detail-progress-summary__text">{summary}</span>
          </div>
          {expanded ? (
            <div className="crm-detail-progress-bar-wrap">
              <div
                className={`crm-detail-progress-bar${completed === 0 ? ' crm-detail-progress-bar--empty' : ''}`}
                role="progressbar"
                aria-valuenow={completed}
                aria-valuemin={0}
                aria-valuemax={periods.length}
                aria-label={summary}
              >
                <div
                  className="crm-detail-progress-bar__fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              {completed === 0 ? (
                <p className="crm-detail-progress-bar__hint">{t('creatorDetail.noPeriodsComplete')}</p>
              ) : null}
            </div>
          ) : (
            <div
              className={`crm-detail-progress-inline-bar${completed === 0 ? ' crm-detail-progress-inline-bar--empty' : ''}`}
              role="progressbar"
              aria-valuenow={completed}
              aria-valuemin={0}
              aria-valuemax={periods.length}
              aria-label={summary}
            >
              <div
                className="crm-detail-progress-inline-bar__fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>
        <button
          type="button"
          className="crm-detail-progress-summary__toggle"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
        >
          {expanded ? t('creatorDetail.hideDetails') : t('creatorDetail.showDetails')}
        </button>
      </div>
      {expanded ? <MonthlyProgressReadView periods={periods} /> : null}
    </div>
  );

  if (embedded && !editing) return <section className="crm-detail-progress-surface"><div className="crm-detail-view-section__header"><h2>{t('creatorDetail.monthlyProgress')}</h2><span>{t('creatorDetail.periods', { count: periods.length })}</span></div>{readContent}</section>;
  return (
    <CreatorSectionCard
      title={t('creatorDetail.monthlyProgress')}
      headerExtra={<span className="crm-detail-progress__periods">{t('creatorDetail.periods', { count: periods.length })}</span>}
      editing={editing}
      padding="0"
      readContent={readContent}
      editContent={
        <Box padding="500">
          <MonthlyProgressEditor periods={periods} onChange={onChange} embedded />
        </Box>
      }
    />
  );
}
