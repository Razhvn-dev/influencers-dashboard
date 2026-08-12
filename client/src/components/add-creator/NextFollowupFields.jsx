import { useCallback, useMemo, useState } from 'react';
import { Box, Button, DatePicker, Icon, OptionList, Popover, TextField } from '@shopify/polaris';
import { CalendarIcon } from '@shopify/polaris-icons';
import { SelectIcon } from '@shopify/polaris-icons';
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
import { useTranslation } from '../../i18n/LanguageContext.jsx';

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

function TimePopoverSelect({ label, options, value, onChange, variant = 'default' }) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((option) => option.value === value)?.label || value;
  const activator = (
    <button
      type="button"
      className={`crm-add-creator-time-select__button${open ? ' crm-add-creator-time-select__button--open' : ''}`}
      aria-label={label}
      aria-expanded={open}
      aria-haspopup="listbox"
      onClick={() => setOpen((current) => !current)}
    >
      <span className="crm-add-creator-time-select__value">{selectedLabel}</span>
      <span className="crm-add-creator-time-select__icon" aria-hidden="true">
        <Icon source={SelectIcon} tone="subdued" />
      </span>
    </button>
  );

  return (
    <div className={`crm-add-creator-time-select crm-add-creator-time-select--${variant}`}>
      <Popover
        active={open}
        activator={activator}
        onClose={() => setOpen(false)}
        preferredAlignment="left"
        preferredPosition="below"
        zIndexOverride={560}
      >
        <Box className="crm-add-creator-time-select__menu">
          <OptionList
            options={options}
            selected={[value]}
            onChange={(selected) => {
              onChange(selected[0]);
              setOpen(false);
            }}
          />
        </Box>
      </Popover>
    </div>
  );
}

export default function NextFollowupFields({ value, onChange }) {
  const { t } = useTranslation();
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
      label={t('creatorCreate.nextFollowup')}
      value={formatFollowupDateOnlyDisplay(value)}
      onChange={() => {}}
      placeholder={t('common.selectDate')}
      autoComplete="off"
      readOnly
      connectedRight={
        <Button
          icon={CalendarIcon}
          onClick={() => setPopoverActive((active) => !active)}
          accessibilityLabel={t('creatorCreate.chooseFollowupDate')}
        />
      }
    />
  );

  return (
    <div className="crm-add-creator__next-followup-fields">
      <div className="crm-add-creator__followup-row">
        <div className="crm-add-creator__date-field">
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
        </div>

        <div className="crm-add-creator__reminder-time">
          <label className="crm-add-creator__reminder-time-label" id="creator-reminder-time-label">
            {t('creatorCreate.reminderTime')}
          </label>
          <div
            className="crm-add-creator__time-field-control"
            aria-labelledby="creator-reminder-time-label"
          >
            <TimePopoverSelect
              label={t('common.hour')}
              options={HOUR_12_OPTIONS}
              value={hour12}
              variant="hour"
              onChange={(nextHour) => handleTimeChange(nextHour, minute, period)}
            />
            <span className="crm-add-creator__reminder-time-separator" aria-hidden="true">:</span>
            <TimePopoverSelect
              label={t('common.minute')}
              options={MINUTE_OPTIONS}
              value={minute}
              variant="minute"
              onChange={(nextMinute) => handleTimeChange(hour12, nextMinute, period)}
            />
            <TimePopoverSelect
              label={t('common.amPm')}
              options={PERIOD_OPTIONS}
              value={period}
              variant="period"
              onChange={(nextPeriod) => handleTimeChange(hour12, minute, nextPeriod)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
