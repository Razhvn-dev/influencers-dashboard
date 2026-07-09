import { useCallback } from 'react';
import { FormLayout, Select } from '@shopify/polaris';
import {
  combineFollowupDateTime,
  to12Hour,
  to24Hour,
  toHour24Parts,
  todayIsoDate,
} from '../../utils/followupDateTime';

const HOUR_12_OPTIONS = Array.from({ length: 12 }, (_, index) => {
  const hour = index + 1;
  return { label: String(hour), value: String(hour) };
});

const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, index) => {
  const minute = String(index).padStart(2, '0');
  return { label: minute, value: minute };
});

const PERIOD_OPTIONS = [
  { label: 'AM', value: 'AM' },
  { label: 'PM', value: 'PM' },
];

export default function ReminderTimeField({ label, value, onChange }) {
  const { date, hour24, minute } = toHour24Parts(value);
  const { hour12, period } = to12Hour(hour24);
  const resolvedDate = date || todayIsoDate();

  const updateTime = useCallback(
    (nextHour12, nextMinute, nextPeriod) => {
      const hour24Value = to24Hour(nextHour12, nextPeriod);
      onChange(combineFollowupDateTime(resolvedDate, hour24Value, nextMinute));
    },
    [onChange, resolvedDate]
  );

  return (
    <div className="crm-add-creator__reminder-time">
      <p className="crm-add-creator__reminder-time-label">{label}</p>
      <FormLayout.Group condensed>
        <Select
          label="Hour"
          labelHidden
          options={HOUR_12_OPTIONS}
          value={hour12}
          onChange={(nextHour) => updateTime(nextHour, minute, period)}
        />
        <Select
          label="Minute"
          labelHidden
          options={MINUTE_OPTIONS}
          value={minute}
          onChange={(nextMinute) => updateTime(hour12, nextMinute, period)}
        />
        <Select
          label="AM/PM"
          labelHidden
          options={PERIOD_OPTIONS}
          value={period}
          onChange={(nextPeriod) => updateTime(hour12, minute, nextPeriod)}
        />
      </FormLayout.Group>
    </div>
  );
}
