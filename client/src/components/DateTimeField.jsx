import { useCallback, useMemo, useState } from 'react';
import {
  BlockStack,
  Box,
  Button,
  DatePicker,
  Icon,
  OptionList,
  Popover,
  TextField,
} from '@shopify/polaris';
import { CalendarIcon, SelectIcon } from '@shopify/polaris-icons';
import { useTranslation } from '../i18n/LanguageContext.jsx';

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, hour) => {
  const value = String(hour).padStart(2, '0');
  return { label: value, value };
});

const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, minute) => {
  const value = String(minute).padStart(2, '0');
  return { label: value, value };
});

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

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function todayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function TimePopoverSelect({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((option) => option.value === value)?.label || value;
  const activator = (
    <button
      type="button"
      className={`crm-detail-time-select__button${open ? ' crm-detail-time-select__button--open' : ''}`}
      aria-label={label}
      aria-expanded={open}
      aria-haspopup="listbox"
      onClick={() => setOpen((current) => !current)}
    >
      <span>{selectedLabel}</span>
      <span className="crm-detail-time-select__icon" aria-hidden="true">
        <Icon source={SelectIcon} tone="subdued" />
      </span>
    </button>
  );

  return (
    <div className="crm-detail-time-select">
      <Popover
        active={open}
        activator={activator}
        onClose={() => setOpen(false)}
        preferredAlignment="left"
        preferredPosition="below"
        zIndexOverride={560}
      >
        <Box className="crm-detail-time-select__menu">
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

export default function DateTimeField({ label, value, onChange, helpText }) {
  const { t } = useTranslation();
  const { date, hour, minute } = splitDateTime(value);
  const selectedDate = parseDateParts(date);
  const anchorDate = selectedDate || new Date();
  const [visibleMonth, setVisibleMonth] = useState(anchorDate.getMonth());
  const [visibleYear, setVisibleYear] = useState(anchorDate.getFullYear());
  const [popoverActive, setPopoverActive] = useState(false);

  const resolvedDate = useMemo(() => date || todayIsoDate(), [date]);

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

  const handleHourChange = useCallback(
    (nextHour) => {
      onChange(combineDateTime(resolvedDate, nextHour, minute));
    },
    [minute, onChange, resolvedDate]
  );

  const handleMinuteChange = useCallback(
    (nextMinute) => {
      onChange(combineDateTime(resolvedDate, hour, nextMinute));
    },
    [hour, onChange, resolvedDate]
  );

  const handleClear = useCallback(() => {
    onChange('');
  }, [onChange]);

  const togglePopover = useCallback(() => {
    setPopoverActive((active) => !active);
  }, []);

  const activator = (
    <TextField
      label={label}
      value={formatDisplay(value)}
      onChange={() => {}}
      placeholder={t('common.selectDateAndTime')}
      autoComplete="off"
      helpText={helpText}
      readOnly
      connectedRight={
        <Button
          icon={CalendarIcon}
          onClick={togglePopover}
          accessibilityLabel={t('creatorCreate.chooseFollowupDate')}
        />
      }
    />
  );

  return (
    <BlockStack gap="200">
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

      {value ? (
        <>
          <div className="crm-detail-time-controls">
            <TimePopoverSelect
              label={t('common.hour')}
              options={HOUR_OPTIONS}
              value={hour}
              onChange={handleHourChange}
            />
            <TimePopoverSelect
              label={t('common.minute')}
              options={MINUTE_OPTIONS}
              value={minute}
              onChange={handleMinuteChange}
            />
            <Button variant="plain" onClick={handleClear}>
              {t('common.clear')}
            </Button>
          </div>
        </>
      ) : null}
    </BlockStack>
  );
}
