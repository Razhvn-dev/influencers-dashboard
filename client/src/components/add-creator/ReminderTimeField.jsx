import { FormLayout, Select } from '@shopify/polaris';

const HOUR_12_OPTIONS = Array.from({ length: 12 }, (_, index) => {
  const hour = index + 1;
  return { label: String(hour), value: String(hour) };
});

const MINUTE_OPTIONS = ['00', '15', '30', '45'].map((minute) => ({
  label: minute,
  value: minute,
}));

const PERIOD_OPTIONS = [
  { label: 'AM', value: 'AM' },
  { label: 'PM', value: 'PM' },
];

function splitDateTime(value) {
  if (!value) {
    return { date: null, hour24: 9, minute: '00' };
  }

  const [datePart, timePart] = value.split('T');
  const [hour = '09', minute = '00'] = (timePart || '09:00').split(':');
  const hour24 = Number.parseInt(hour, 10);

  return {
    date: datePart || null,
    hour24: Number.isNaN(hour24) ? 9 : hour24,
    minute: minute.padStart(2, '0').slice(0, 2),
  };
}

function to12Hour(hour24) {
  const normalized = ((hour24 % 24) + 24) % 24;
  const period = normalized >= 12 ? 'PM' : 'AM';
  const hour12 = normalized % 12 || 12;
  return { hour12: String(hour12), period };
}

function to24Hour(hour12, period) {
  let hour = Number.parseInt(hour12, 10);
  if (Number.isNaN(hour)) hour = 9;

  if (period === 'AM') {
    return hour === 12 ? 0 : hour;
  }

  return hour === 12 ? 12 : hour + 12;
}

function combineDateTime(date, hour24, minute) {
  if (!date) return '';
  const hour = String(hour24).padStart(2, '0');
  return `${date}T${hour}:${minute || '00'}`;
}

function todayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function ReminderTimeField({ label, value, onChange }) {
  const { date, hour24, minute } = splitDateTime(value);
  const { hour12, period } = to12Hour(hour24);
  const resolvedDate = date || todayIsoDate();

  const updateTime = (nextHour12, nextMinute, nextPeriod) => {
    const hour24Value = to24Hour(nextHour12, nextPeriod);
    onChange(combineDateTime(resolvedDate, hour24Value, nextMinute));
  };

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
