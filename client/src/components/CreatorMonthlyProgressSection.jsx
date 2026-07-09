import { useEffect, useState } from 'react';
import { Box, Icon } from '@shopify/polaris';
import { CheckCircleIcon } from '@shopify/polaris-icons';
import CreatorSectionCard from './CreatorSectionCard';
import MonthlyProgressEditor from './MonthlyProgressEditor';
import MonthlyProgressReadView, { countCompletedPeriods } from './MonthlyProgressReadView';

export default function CreatorMonthlyProgressSection({
  periods,
  onChange,
  editing = false,
}) {
  const [expanded, setExpanded] = useState(editing);

  useEffect(() => {
    if (editing) {
      setExpanded(true);
    }
  }, [editing]);

  const completed = countCompletedPeriods(periods);
  const total = periods.length || 1;
  const progressPercent = Math.round((completed / total) * 100);
  const summary = `${completed} of ${periods.length} periods complete`;

  const readContent = (
    <div className="crm-detail-progress">
      <div className="crm-detail-progress-summary">
        <div className="crm-detail-progress-summary__main">
          <div className="crm-detail-progress-summary__stats">
            <span className="crm-detail-progress-summary__icon" aria-hidden="true">
              <Icon source={CheckCircleIcon} />
            </span>
            <span className="crm-detail-progress-summary__text">{summary}</span>
          </div>
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
              <p className="crm-detail-progress-bar__hint">No periods completed yet</p>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          className="crm-detail-progress-summary__toggle"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
        >
          {expanded ? 'Hide details' : 'Show details'}
        </button>
      </div>
      {expanded ? <MonthlyProgressReadView periods={periods} /> : null}
    </div>
  );

  return (
    <CreatorSectionCard
      title={`Monthly Progress (${periods.length} Contract Periods)`}
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
