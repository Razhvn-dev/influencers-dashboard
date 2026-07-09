export function splitFollowupDateTime(value) {
  if (!value) {
    return { date: null, hour: '09', minute: '00' };
  }

  const [datePart, timePart] = String(value).split('T');
  const [hour = '09', minute = '00'] = (timePart || '09:00').split(':');

  return {
    date: datePart || null,
    hour: hour.padStart(2, '0').slice(0, 2),
    minute: minute.padStart(2, '0').slice(0, 2),
  };
}

export function combineFollowupDateTime(date, hour, minute) {
  if (!date) return '';
  const normalizedHour = String(hour || '09').padStart(2, '0').slice(0, 2);
  const normalizedMinute = String(minute || '00').padStart(2, '0').slice(0, 2);
  return `${date}T${normalizedHour}:${normalizedMinute}`;
}

export function parseFollowupDateParts(dateString) {
  if (!dateString) return null;

  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

export function formatFollowupDateOnlyDisplay(value) {
  if (!value) return '';

  const [datePart] = String(value).split('T');
  const date = parseFollowupDateParts(datePart);
  if (!date) return '';

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function extractDateFromPickerRange(range) {
  if (!range) return null;

  if (range instanceof Date) {
    return range;
  }

  if (range.start instanceof Date) {
    return range.start;
  }

  if (range.end instanceof Date) {
    return range.end;
  }

  return null;
}

export function toFollowupPickerRange(value) {
  const { date } = splitFollowupDateTime(value);
  const selectedDate = parseFollowupDateParts(date);
  if (!selectedDate) return undefined;

  return { start: selectedDate, end: selectedDate };
}

export function toHour24Parts(value) {
  const { date, hour, minute } = splitFollowupDateTime(value);
  const hour24 = Number.parseInt(hour, 10);

  return {
    date,
    hour24: Number.isNaN(hour24) ? 9 : hour24,
    minute,
  };
}

export function to12Hour(hour24) {
  const normalized = ((hour24 % 24) + 24) % 24;
  const period = normalized >= 12 ? 'PM' : 'AM';
  const hour12 = normalized % 12 || 12;
  return { hour12: String(hour12), period };
}

export function to24Hour(hour12, period) {
  let hour = Number.parseInt(hour12, 10);
  if (Number.isNaN(hour)) hour = 9;

  if (period === 'AM') {
    return hour === 12 ? 0 : hour;
  }

  return hour === 12 ? 12 : hour + 12;
}

export function todayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
