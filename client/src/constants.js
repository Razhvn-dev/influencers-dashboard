export const STATUS_OPTIONS = [
  { label: 'Applied', value: 'Applied' },
  { label: 'Contacted', value: 'Contacted' },
  { label: 'Call Scheduled', value: 'Call Scheduled' },
  { label: 'Under Review', value: 'Under Review' },
  { label: 'Approved', value: 'Approved' },
  { label: 'Rejected', value: 'Rejected' },
  { label: 'Active Ambassador', value: 'Active Ambassador' },
  { label: 'Past Partner', value: 'Past Partner' },
  { label: 'Partnered (legacy)', value: 'Partnered' },
];

export const STATUS_FILTER_OPTIONS = [
  { label: 'All statuses', value: '' },
  ...STATUS_OPTIONS,
];

export const LEVEL_OPTIONS = [
  { label: 'All levels', value: '' },
  { label: 'Ambassador 1', value: 'Level 1' },
  { label: 'Ambassador 2', value: 'Level 2' },
  { label: 'Ambassador 3', value: 'Level 3' },
];

export const COMMISSION_OPTIONS = [
  { label: '—', value: '' },
  { label: 'YES', value: 'YES' },
  { label: 'NO', value: 'NO' },
];

export const COMMISSION_FILTER_OPTIONS = [
  { label: 'All commission values', value: '' },
  { label: 'YES', value: 'YES' },
  { label: 'NO', value: 'NO' },
];

export const FOLLOWUP_FILTER_HELP =
  'Shows creators with Next Follow-up set within the next 7 days, including overdue dates.';

export function normalizeExternalUrl(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function openExternalUrl(value) {
  const url = normalizeExternalUrl(value);
  if (!url) return false;
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}

export function sanitizeFollowerInput(value) {
  if (value === '' || value == null) return '';

  const parsed = Number.parseInt(String(value), 10);
  if (Number.isNaN(parsed)) return '';
  return String(Math.max(0, parsed));
}

export function parseFollowerCount(value) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (Number.isNaN(parsed)) return 0;
  return Math.max(0, parsed);
}

export const MONTHLY_PERIOD_LABELS = [
  'Period 1',
  'Period 2',
  'Period 3',
  'Period 4',
  'Period 5',
];

export function displayAmbassadorLevel(level) {
  if (level === 'Level 3') return 'Ambassador 3';
  if (level === 'Level 2') return 'Ambassador 2';
  if (level === 'Level 1') return 'Ambassador 1';
  return level || 'Ambassador 1';
}

export function statusTone(status) {
  if (status === 'Active Ambassador' || status === 'Partnered') return 'success';
  if (status === 'Approved') return 'info';
  if (status === 'Rejected') return 'critical';
  if (status === 'Call Scheduled' || status === 'Under Review') return 'warning';
  return 'attention';
}

export function levelTone(level) {
  if (level === 'Level 3') return 'success';
  if (level === 'Level 2') return 'info';
  return undefined;
}

export function emptyMonthlyProgress() {
  return Array.from({ length: 5 }, (_, index) => ({
    period_index: index + 1,
    monthly_check_in: '',
    content_delivered: '',
    link: '',
  }));
}

export function normalizeMonthlyProgressForForm(input) {
  const base = emptyMonthlyProgress();
  const source = Array.isArray(input) ? input : [];

  return base.map((period) => {
    const match = source.find((item) => Number(item.period_index) === period.period_index);
    if (!match) return period;

    return {
      period_index: period.period_index,
      monthly_check_in: match.monthly_check_in || '',
      content_delivered: match.content_delivered || '',
      link: match.link || '',
    };
  });
}

function toInputDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 16);
}

export function buildFormStateFromRecord(record) {
  return {
    name: record.name || '',
    channel: record.channel || '',
    sponsored_products: record.sponsored_products || '',
    affiliate_code: record.affiliate_code || '',
    commission: record.commission || '',
    order_numbers: record.order_numbers || '',
    required_deliverables: record.required_deliverables || '',
    email: record.email || '',
    region: record.region || '',
    status: record.status || 'Active Ambassador',
    notes: record.notes || '',
    youtube_url: record.youtube_url || '',
    facebook_url: record.facebook_url || '',
    instagram_url: record.instagram_url || '',
    tiktok_url: record.tiktok_url || '',
    youtube_followers: String(record.youtube_followers ?? 0),
    facebook_followers: String(record.facebook_followers ?? 0),
    instagram_followers: String(record.instagram_followers ?? 0),
    tiktok_followers: String(record.tiktok_followers ?? 0),
    contract_status: record.contract_status || '',
    last_contacted_at: toInputDate(record.last_contacted_at),
    next_followup_at: toInputDate(record.next_followup_at),
    monthly_progress: normalizeMonthlyProgressForForm(record.monthly_progress),
  };
}

export function buildEmptyCreatorForm() {
  return buildFormStateFromRecord({
    status: 'Applied',
    youtube_followers: 0,
    facebook_followers: 0,
    instagram_followers: 0,
    tiktok_followers: 0,
    monthly_progress: emptyMonthlyProgress(),
  });
}

export function buildSavePayload(form) {
  return {
    name: form.name.trim(),
    channel: form.channel.trim() || null,
    sponsored_products: form.sponsored_products.trim() || null,
    affiliate_code: form.affiliate_code.trim() || null,
    commission: form.commission || null,
    order_numbers: form.order_numbers.trim() || null,
    required_deliverables: form.required_deliverables.trim() || null,
    email: form.email.trim() || null,
    region: form.region.trim() || null,
    status: form.status || 'Active Ambassador',
    notes: form.notes.trim() || null,
    youtube_url: form.youtube_url.trim() || null,
    facebook_url: form.facebook_url.trim() || null,
    instagram_url: form.instagram_url.trim() || null,
    tiktok_url: form.tiktok_url.trim() || null,
    youtube_followers: parseFollowerCount(form.youtube_followers),
    facebook_followers: parseFollowerCount(form.facebook_followers),
    instagram_followers: parseFollowerCount(form.instagram_followers),
    tiktok_followers: parseFollowerCount(form.tiktok_followers),
    contract_status: form.contract_status.trim() || null,
    last_contacted_at: form.last_contacted_at
      ? new Date(form.last_contacted_at).toISOString()
      : null,
    next_followup_at: form.next_followup_at
      ? new Date(form.next_followup_at).toISOString()
      : null,
    monthly_progress: form.monthly_progress.map((period) => ({
      period_index: period.period_index,
      monthly_check_in: period.monthly_check_in.trim() || null,
      content_delivered: period.content_delivered.trim() || null,
      link: period.link.trim() || null,
    })),
  };
}

export function previewAmbassadorLevel(form) {
  const total =
    parseFollowerCount(form.youtube_followers) +
    parseFollowerCount(form.facebook_followers) +
    parseFollowerCount(form.instagram_followers) +
    parseFollowerCount(form.tiktok_followers);
  const youtube = parseFollowerCount(form.youtube_followers);

  if (total > 500000 && youtube > 100000) return 'Level 3';
  if (total > 100000) return 'Level 2';
  return 'Level 1';
}
