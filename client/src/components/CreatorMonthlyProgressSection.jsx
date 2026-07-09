import { Box, Icon } from '@shopify/polaris';
import {
  ChartLineIcon,
  CheckCircleIcon,
  CursorIcon,
  DiscountIcon,
  TeamIcon,
} from '@shopify/polaris-icons';
import CreatorSectionCard from './CreatorSectionCard';
import MonthlyProgressEditor from './MonthlyProgressEditor';
import MonthlyProgressReadView from './MonthlyProgressReadView';

function countFilled(periods, field) {
  return periods.filter((period) => String(period[field] || '').trim()).length;
}

function ProgressMetric({ icon, label, value, tone }) {
  return (
    <div className="crm-detail-progress-metric">
      <span className={`crm-detail-progress-metric__icon crm-detail-progress-metric__icon--${tone}`}>
        <Icon source={icon} />
      </span>
      <span>
        <small>{label}</small>
        <strong>{value}</strong>
      </span>
    </div>
  );
}

export default function CreatorMonthlyProgressSection({
  periods,
  onChange,
  editing = false,
  onEdit,
  onDone,
}) {
  const delivered = countFilled(periods, 'content_delivered');
  const links = countFilled(periods, 'link');

  const readContent = (
    <div className="crm-detail-progress">
      <div className="crm-detail-progress-metrics">
        <ProgressMetric icon={TeamIcon} label="Brands" value="4 / 10" tone="blue" />
        <ProgressMetric icon={DiscountIcon} label="Monthly Deals" value="3" tone="green" />
        <ProgressMetric
          icon={CheckCircleIcon}
          label="Content Delivered"
          value={`${delivered} / ${periods.length}`}
          tone="mint"
        />
        <ProgressMetric icon={CursorIcon} label="Link Clicks" value={links || '0'} tone="indigo" />
        <ProgressMetric icon={ChartLineIcon} label="Conversion" value="Not set" tone="orange" />
      </div>
      <MonthlyProgressReadView periods={periods} />
    </div>
  );

  return (
    <CreatorSectionCard
      title={`Monthly Progress (${periods.length} Contract Periods)`}
      editing={editing}
      onEdit={onEdit}
      onDone={onDone}
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
