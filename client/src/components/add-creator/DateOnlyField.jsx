import { useCallback, useState } from 'react';
import { Box, Button, DatePicker, Popover, TextField } from '@shopify/polaris';
import { CalendarIcon } from '@shopify/polaris-icons';

function splitDateTime(value) {
  if (!value) {
    return { date: null, hour: '09', minute: '00' };
  }

  const [datePart, timePart] = value.split('T');
  const [hour = '09', minute = '00'] = (timePart || '09:00').split(':');

  return {
    date: datePart || null,
    hour: hour.padStart(2, '0').slice(0, 2),
    minute: minute.padStart(2, '0').slice(0, 2),
  };
}

function combineDateTime(date, hour, minute) {
  if (!date) return '';
  return `${date}T${hour || '09'}:${minute || '00'}`;
}

function parseDateParts(dateString) {
  if (!dateString) return null;

  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

function formatDisplay(value) {
  if (!value) return '';

  const [datePart] = String(value).split('T');
  const date = parseDateParts(datePart);
  if (!date) return '';

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function DateOnlyField({ label, value, onChange, helpText }) {
  const { date, hour, minute } = splitDateTime(value);
  const selectedDate = parseDateParts(date);
  const anchorDate = selectedDate || new Date();
  const [visibleMonth, setVisibleMonth] = useState(anchorDate.getMonth());
  const [visibleYear, setVisibleYear] = useState(anchorDate.getFullYear());
  const [popoverActive, setPopoverActive] = useState(false);

  const handleMonthChange = useCallback((month, year) => {
    setVisibleMonth(month);
    setVisibleYear(year);
  }, []);

  const handleDateSelection = useCallback(
    ({ start }) => {
      const year = start.getFullYear();
      const month = String(start.getMonth() + 1).padStart(2, '0');
      const day = String(start.getDate()).padStart(2, '0');
      onChange(combineDateTime(`${year}-${month}-${day}`, hour, minute));
      setPopoverActive(false);
    },
    [hour, minute, onChange]
  );

  const activator = (
    <TextField
      label={label}
      value={formatDisplay(value)}
      onChange={() => {}}
      placeholder="Select date"
      autoComplete="off"
      helpText={helpText}
      readOnly
      connectedRight={
        <Button
          icon={CalendarIcon}
          onClick={() => setPopoverActive((active) => !active)}
          accessibilityLabel={`Choose ${label}`}
        />
      }
    />
  );

  return (
    <Popover
      active={popoverActive}
      activator={activator}
      onClose={() => setPopoverActive(false)}
      preferredAlignment="left"
    >
      <Box padding="300" minWidth="320px">
        <DatePicker
          month={visibleMonth}
          year={visibleYear}
          onChange={handleDateSelection}
          onMonthChange={handleMonthChange}
          selected={selectedDate || undefined}
        />
      </Box>
    </Popover>
  );
}
