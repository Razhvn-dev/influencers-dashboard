import { useCallback, useMemo, useState } from 'react';
import { Box, Button, DatePicker, FormLayout, Popover, Select, TextField } from '@shopify/polaris';
import { CalendarIcon } from '@shopify/polaris-icons';
import {
  combineFollowupDateTime,
  extractDateFromPickerRange,
  formatFollowupDateOnlyDisplay,
  parseFollowupDateParts,
  splitFollowupDateTime,
  to12Hour,
  to24Hour,
  toFollowupPickerRange,
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

export default function NextFollowupFields({ value, onChange }) {
  const { date, hour, minute } = splitFollowupDateTime(value);
  const hour24 = Number.parseInt(hour, 10);
  const normalizedHour24 = Number.isNaN(hour24) ? 9 : hour24;
  const { hour12, period } = to12Hour(normalizedHour24);

  const selectedDate = parseFollowupDateParts(date);
  const anchorDate = selectedDate || new Date();
  const [visibleMonth, setVisibleMonth] = useState(anchorDate.getMonth());
  const [visibleYear, setVisibleYear] = useState(anchorDate.getFullYear());
  const [popoverActive, setPopoverActive] = useState(false);

  const pickerSelected = useMemo(() => toFollowupPickerRange(value), [value]);
  const resolvedDate = date || todayIsoDate();

  const handleMonthChange = useCallback((month, year) => {
    setVisibleMonth(month);
    setVisibleYear(year);
  }, []);

  const handleDateSelection = useCallback(
    (range) => {
      const selected = extractDateFromPickerRange(range);
      if (!selected) return;

      const year = selected.getFullYear();
      const month = String(selected.getMonth() + 1).padStart(2, '0');
      const day = String(selected.getDate()).padStart(2, '0');
      onChange(
        combineFollowupDateTime(`${year}-${month}-${day}`, normalizedHour24, minute)
      );
      setPopoverActive(false);
    },
    [minute, normalizedHour24, onChange]
  );

  const handleTimeChange = useCallback(
    (nextHour12, nextMinute, nextPeriod) => {
      const nextHour24 = to24Hour(nextHour12, nextPeriod);
      onChange(combineFollowupDateTime(resolvedDate, nextHour24, nextMinute));
    },
    [onChange, resolvedDate]
  );

  const dateActivator = (
    <TextField
      label="Next Follow-up"
      value={formatFollowupDateOnlyDisplay(value)}
      onChange={() => {}}
      placeholder="Select date"
      autoComplete="off"
      readOnly
      connectedRight={
        <Button
          icon={CalendarIcon}
          onClick={() => setPopoverActive((active) => !active)}
          accessibilityLabel="Choose Next Follow-up date"
        />
      }
    />
  );

  return (
    <FormLayout.Group>
      <Popover
        active={popoverActive}
        activator={dateActivator}
        onClose={() => setPopoverActive(false)}
        preferredAlignment="left"
      >
        <Box padding="300" minWidth="320px">
          <DatePicker
            month={visibleMonth}
            year={visibleYear}
            onChange={handleDateSelection}
            onMonthChange={handleMonthChange}
            selected={pickerSelected}
          />
        </Box>
      </Popover>

      <div className="crm-add-creator__reminder-time">
        <p className="crm-add-creator__reminder-time-label">Reminder Time</p>
        <FormLayout.Group condensed>
          <Select
            label="Hour"
            labelHidden
            options={HOUR_12_OPTIONS}
            value={hour12}
            onChange={(nextHour) => handleTimeChange(nextHour, minute, period)}
          />
          <Select
            label="Minute"
            labelHidden
            options={MINUTE_OPTIONS}
            value={minute}
            onChange={(nextMinute) => handleTimeChange(hour12, nextMinute, period)}
          />
          <Select
            label="AM/PM"
            labelHidden
            options={PERIOD_OPTIONS}
            value={period}
            onChange={(nextPeriod) => handleTimeChange(hour12, minute, nextPeriod)}
          />
        </FormLayout.Group>
      </div>
    </FormLayout.Group>
  );
}
