import {
  computeAmbassadorLevelFromFollowers,
} from './utils/ambassadorLevel';
import { derivePrimaryChannelFromFollowers } from './utils/primaryChannel';

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

export function getTranslatedStatusOptions(t) {
  return STATUS_OPTIONS.map((option) => ({
    ...option,
    label: option.value ? t(`status.${option.value}`) : option.label,
  }));
}

export const STATUS_FILTER_OPTIONS = [
  { label: 'All statuses', value: '' },
  ...STATUS_OPTIONS,
];

export const AMBASSADOR_TIERS = [
  'Creator Sponsorship',
  'Ambassador 1',
  'Ambassador 2',
  'Ambassador 3',
];

export const LEVEL_OPTIONS = [
  { label: 'All levels', value: '' },
  ...AMBASSADOR_TIERS.map((tier) => ({ label: tier, value: tier })),
];

export const COMMISSION_OPTIONS = [
  { label: '—', value: '' },
  { label: 'YES', value: 'YES' },
  { label: 'NO', value: 'NO' },
];

export function getTranslatedCommissionOptions(t) {
  return COMMISSION_OPTIONS.map((option) => ({
    ...option,
    label: option.value ? option.label : t('common.emptyValue'),
  }));
}

export const COMMISSION_FILTER_OPTIONS = [
  { label: 'All commission values', value: '' },
  { label: 'YES', value: 'YES' },
  { label: 'NO', value: 'NO' },
];

export const PRIMARY_CHANNEL_OPTIONS = [
  { label: 'Select a platform', value: '' },
  { label: 'YouTube', value: 'YouTube' },
  { label: 'Instagram', value: 'Instagram' },
  { label: 'Facebook', value: 'Facebook' },
  { label: 'TikTok', value: 'TikTok' },
];

export const MANAGER_OWNER_OPTIONS = [
  { label: '—', value: '' },
  { label: 'Current User', value: 'Current User' },
];

export function getTranslatedManagerOwnerOptions(t) {
  return MANAGER_OWNER_OPTIONS.map((option) => ({
    ...option,
    label: option.value ? t('common.currentUser') : t('common.emptyValue'),
  }));
}

export const PRIMARY_CHANNEL_PLATFORM_KEYS = {
  YouTube: 'youtube_url',
  Instagram: 'instagram_url',
  Facebook: 'facebook_url',
  TikTok: 'tiktok_url',
};

export function getPrimaryChannelPlatformKey(channelLabel) {
  return PRIMARY_CHANNEL_PLATFORM_KEYS[channelLabel] || null;
}

export const FOLLOWUP_FILTER_HELP =
  'Due in 7 days shows upcoming follow-ups only. Overdue shows past-due dates only.';

export const DUE_FOLLOWUP_FILTER_OPTIONS = [
  { label: 'All follow-ups', value: '' },
  { label: 'Due in 7 days', value: 'due' },
  { label: 'Overdue', value: 'overdue' },
];

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function formatRelativeTime(value) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} wk ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} mo ago`;

  return `${Math.floor(diffDays / 365)} yr ago`;
}

export function formatFollowupDate(value) {
  if (!value) return '—';

  const [datePart] = String(value).split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  if (!year || !month || !day) return '—';

  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatFollowupDateTime(value) {
  if (!value) return null;

  const [datePart, timePart] = String(value).split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return null;

  const dateLabel = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  if (!timePart) return dateLabel;

  const [hour24, minuteRaw] = timePart.split(':');
  const hour = Number.parseInt(hour24, 10);
  const minute = Number.parseInt(minuteRaw, 10);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return dateLabel;

  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;

  return `${dateLabel}, ${hour12}:${String(minute).padStart(2, '0')} ${period}`;
}

export function getNextFollowupPreviewLabel(value) {
  const formatted = formatFollowupDateTime(value);
  if (formatted) return formatted;

  const trimmed = String(value ?? '').trim();
  if (!trimmed) return 'None';

  const dateOnly = formatFollowupDate(trimmed);
  return dateOnly !== '—' ? dateOnly : 'None';
}

export function getFollowupStatus(nextFollowupAt) {
  if (!nextFollowupAt) return null;

  const due = new Date(nextFollowupAt);
  if (Number.isNaN(due.getTime())) return null;

  const now = new Date();
  if (due.getTime() < now.getTime()) {
    return { tone: 'critical', label: 'Overdue' };
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + 7);
  if (due <= cutoff) {
    return { tone: 'warning', label: 'Due' };
  }

  return null;
}

export const PLATFORM_META = [
  {
    key: 'youtube_url',
    shortLabel: 'YT',
    label: 'YouTube',
    followerField: 'youtube_followers',
    iconBackground: '#FEE2E2',
    iconColor: '#DC2626',
  },
  {
    key: 'instagram_url',
    shortLabel: 'IG',
    label: 'Instagram',
    followerField: 'instagram_followers',
    iconBackground: '#FCE7F3',
    iconColor: '#DB2777',
  },
  {
    key: 'facebook_url',
    shortLabel: 'FB',
    label: 'Facebook',
    followerField: 'facebook_followers',
    iconBackground: '#DBEAFE',
    iconColor: '#2563EB',
  },
  {
    key: 'tiktok_url',
    shortLabel: 'TT',
    label: 'TikTok',
    followerField: 'tiktok_followers',
    iconBackground: '#F3F4F6',
    iconColor: '#111827',
  },
];

export const PLATFORM_FILTER_OPTIONS = [
  { label: 'All platforms', value: '' },
  ...PLATFORM_META.map((platform) => ({
    label: platform.label,
    value: platform.key,
  })),
];

export function getPlatformMeta(platformKey) {
  return PLATFORM_META.find((platform) => platform.key === platformKey) || null;
}

export function formatCompactNumber(value) {
  const num = Number(value || 0);

  if (Number.isNaN(num)) {
    return '0';
  }

  if (num >= 1_000_000) {
    const millions = num / 1_000_000;
    const formatted = millions.toFixed(2);
    return `${formatted.replace(/\.?0+$/, '')}M`;
  }

  if (num >= 1_000) {
    const thousands = num / 1_000;
    const formatted = thousands.toFixed(1);
    return `${formatted.replace(/\.0$/, '')}K`;
  }

  return num.toLocaleString('en-US');
}

export function getCreatorInitials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return '?';
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
}

export function creatorHandle(record) {
  const channel = String(record?.channel || '').trim();

  if (channel) {
    if (channel.startsWith('@')) return channel;
    if (!channel.includes(' ') && !channel.includes('://')) return `@${channel}`;
    return channel;
  }

  for (const platform of PLATFORM_META) {
    const url = normalizeExternalUrl(record?.[platform.key]);
    if (!url) continue;

    try {
      const parsed = new URL(url);
      const parts = parsed.pathname.split('/').filter(Boolean);
      if (parts.length === 0) continue;

      const handle = parts[parts.length - 1].replace(/^@/, '');
      if (handle) return `@${handle}`;
    } catch {
      // Ignore invalid URLs.
    }
  }

  return '—';
}

export function creatorTagline(record, max = 42) {
  const products = String(record?.sponsored_products || '').trim();
  if (products) {
    return products.length > max ? `${products.slice(0, max)}…` : products;
  }

  const region = String(record?.region || '').trim();
  return region || '—';
}

export function formatLastContactLabel(value) {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  const today = startOfDay(new Date());
  const contactDay = startOfDay(date);
  const diffDays = Math.round((today.getTime() - contactDay.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return formatRelativeTime(value);

  return formatFollowupDate(value);
}

export function getFollowupEmphasis(nextFollowupAt) {
  if (!nextFollowupAt) return null;

  const due = new Date(nextFollowupAt);
  if (Number.isNaN(due.getTime())) return null;

  const today = startOfDay(new Date());
  const dueDay = startOfDay(due);
  const diffDays = Math.round((dueDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: 'Overdue', tone: 'critical' };
  }

  if (diffDays === 0) {
    return { label: 'Today', tone: 'warning' };
  }

  if (diffDays === 1) {
    return { label: 'Tomorrow', tone: 'success' };
  }

  if (diffDays <= 14) {
    return { label: `In ${diffDays} days`, tone: 'warning' };
  }

  return { label: formatFollowupDate(nextFollowupAt), tone: undefined };
}

export function formatVerifiedTimestamp(value) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

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

export function platformHandleFromUrl(url) {
  const normalized = normalizeExternalUrl(url);
  if (!normalized) return '—';

  try {
    const parsed = new URL(normalized);
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length === 0) return normalized;

    const handle = parts[parts.length - 1].replace(/^@/, '');
    return handle ? `@${handle}` : normalized;
  } catch {
    return url;
  }
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

export function derivePrimaryChannel(form) {
  return derivePrimaryChannelFromFollowers(form);
}

export function deriveAddCreatorPlatformPreview(form) {
  const platformFields = {
    youtube_followers: form?.youtube_followers ?? '',
    instagram_followers: form?.instagram_followers ?? '',
    facebook_followers: form?.facebook_followers ?? '',
    tiktok_followers: form?.tiktok_followers ?? '',
    youtube_url: form?.youtube_url ?? '',
    instagram_url: form?.instagram_url ?? '',
    facebook_url: form?.facebook_url ?? '',
    tiktok_url: form?.tiktok_url ?? '',
  };

  const platforms = PLATFORM_META.map((platform) => {
    const followers = parseFollowerCount(platformFields[platform.followerField]);
    const url = String(platformFields[platform.key] ?? '').trim();

    return {
      key: platform.key,
      label: platform.label,
      followerField: platform.followerField,
      followers,
      url,
      followerDisplay: formatCompactNumber(followers),
      isConnected: url.length > 0 || followers > 0,
    };
  });

  const connectedPlatformsCount = platforms.filter((platform) => platform.isConnected).length;
  const primaryChannel = derivePrimaryChannel(form);

  return {
    platformFields,
    platforms,
    connectedPlatformsCount,
    primaryChannel,
  };
}

export const MONTHLY_PERIOD_LABELS = [
  'Period 1',
  'Period 2',
  'Period 3',
  'Period 4',
  'Period 5',
];

export function displayAmbassadorLevel(levelOrForm, totalFollowers) {
  if (levelOrForm && typeof levelOrForm === 'object') {
    const total =
      parseFollowerCount(levelOrForm.youtube_followers) +
      parseFollowerCount(levelOrForm.facebook_followers) +
      parseFollowerCount(levelOrForm.instagram_followers) +
      parseFollowerCount(levelOrForm.tiktok_followers);

    return computeAmbassadorLevelFromFollowers(
      levelOrForm.total_followers ?? total
    );
  }

  if (totalFollowers != null) {
    return computeAmbassadorLevelFromFollowers(totalFollowers);
  }

  const trimmed = String(levelOrForm ?? '').trim();
  if (!trimmed) return '—';
  return trimmed;
}

export function levelTone(level) {
  if (level === 'Ambassador 3') return 'success';
  if (level === 'Ambassador 2') return 'success';
  if (level === 'Ambassador 1') return 'info';
  if (level === 'Creator Sponsorship') return 'attention';
  return undefined;
}

export function getAmbassadorLevelClass(level) {
  if (level === 'Ambassador 3') return 'crm-level-pill--3';
  if (level === 'Ambassador 2') return 'crm-level-pill--2';
  if (level === 'Ambassador 1') return 'crm-level-pill--1';
  if (level === 'Creator Sponsorship') return 'crm-level-pill--sponsorship';
  return 'crm-level-pill--legacy';
}

export function statusTone(status) {
  if (
    status === 'Active Ambassador' ||
    status === 'Partnered' ||
    status === 'Approved' ||
    status === 'Contract Signed'
  ) {
    return 'success';
  }
  if (status === 'Contacted' || status === 'Negotiating') return 'info';
  if (status === 'Rejected') return 'critical';
  if (status === 'Call Scheduled' || status === 'Under Review') return 'warning';
  if (status === 'Applied') return 'attention';
  if (status === 'Past Partner') return 'attention';
  return 'attention';
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
  const formFollowers = {
    youtube_followers: record.youtube_followers ?? 0,
    facebook_followers: record.facebook_followers ?? 0,
    instagram_followers: record.instagram_followers ?? 0,
    tiktok_followers: record.tiktok_followers ?? 0,
    total_followers: record.total_followers ?? 0,
  };

  return {
    name: record.name || '',
    channel: record.channel || '',
    primary_channel: derivePrimaryChannel({
      ...record,
      ...formFollowers,
    }),
    niche_category: record.niche_category || '',
    bio: record.bio || '',
    manager_owner: record.manager_owner || '',
    tags: record.tags || '',
    sponsored_products: record.sponsored_products || '',
    affiliate_code: record.affiliate_code || '',
    commission: record.commission || '',
    order_numbers: record.order_numbers || '',
    required_deliverables: record.required_deliverables || '',
    email: record.email || '',
    region: record.region || '',
    status: record.status || 'Applied',
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
    followers_last_verified_at: formatVerifiedTimestamp(record.followers_last_verified_at),
    followers_verified_by: record.followers_verified_by || '',
    ambassador_level: computeAmbassadorLevelFromFollowers(record.total_followers),
    monthly_progress: normalizeMonthlyProgressForForm(record.monthly_progress),
  };
}

export function buildEmptyCreatorForm() {
  return buildFormStateFromRecord({
    status: 'Applied',
    manager_owner: 'Current User',
    youtube_followers: '',
    facebook_followers: '',
    instagram_followers: '',
    tiktok_followers: '',
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
    status: form.status || 'Applied',
    notes: form.notes.trim() || null,
    youtube_url: form.youtube_url.trim() || null,
    facebook_url: form.facebook_url.trim() || null,
    instagram_url: form.instagram_url.trim() || null,
    tiktok_url: form.tiktok_url.trim() || null,
    youtube_followers: parseFollowerCount(form.youtube_followers),
    facebook_followers: parseFollowerCount(form.facebook_followers),
    instagram_followers: parseFollowerCount(form.instagram_followers),
    tiktok_followers: parseFollowerCount(form.tiktok_followers),
    niche_category: form.niche_category.trim() || null,
    bio: form.bio.trim() || null,
    tags: form.tags.trim() || null,
    manager_owner: form.manager_owner.trim() || null,
    contract_status: form.contract_status.trim() || null,
    last_contacted_at: form.last_contacted_at
      ? new Date(form.last_contacted_at).toISOString()
      : null,
    next_followup_at: form.next_followup_at
      ? new Date(form.next_followup_at).toISOString()
      : null,
    monthly_progress: (form.monthly_progress || []).map((period) => ({
      period_index: period.period_index,
      monthly_check_in: String(period.monthly_check_in ?? '').trim() || null,
      content_delivered: String(period.content_delivered ?? '').trim() || null,
      link: String(period.link ?? '').trim() || null,
    })),
  };
}

export function previewAmbassadorLevel(form) {
  return computeAmbassadorLevelFromFollowers(
    parseFollowerCount(form.youtube_followers) +
      parseFollowerCount(form.facebook_followers) +
      parseFollowerCount(form.instagram_followers) +
      parseFollowerCount(form.tiktok_followers)
  );
}
