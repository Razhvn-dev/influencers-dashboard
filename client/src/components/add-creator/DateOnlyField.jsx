import { useCallback, useMemo, useState } from 'react';
import { Box, Button, DatePicker, Popover, TextField } from '@shopify/polaris';
import { CalendarIcon } from '@shopify/polaris-icons';
import {
  combineFollowupDateTime,
  extractDateFromPickerRange,
  formatFollowupDateOnlyDisplay,
  parseFollowupDateParts,
  splitFollowupDateTime,
  toFollowupPickerRange,
} from '../../utils/followupDateTime';

export default function DateOnlyField({ label, value, onChange, helpText }) {
  const { date, hour, minute } = splitFollowupDateTime(value);
  const selectedDate = parseFollowupDateParts(date);
  const anchorDate = selectedDate || new Date();
  const [visibleMonth, setVisibleMonth] = useState(anchorDate.getMonth());
  const [visibleYear, setVisibleYear] = useState(anchorDate.getFullYear());
  const [popoverActive, setPopoverActive] = useState(false);

  const pickerSelected = useMemo(() => toFollowupPickerRange(value), [value]);

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
      onChange(combineFollowupDateTime(`${year}-${month}-${day}`, hour, minute));
      setPopoverActive(false);
    },
    [hour, minute, onChange]
  );

  const activator = (
    <TextField
      label={label}
      value={formatFollowupDateOnlyDisplay(value)}
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
          selected={pickerSelected}
        />
      </Box>
    </Popover>
  );
}
