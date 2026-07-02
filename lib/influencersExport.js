function displayAmbassadorLevel(level) {
  if (level === 2) return 'Level 2';
  if (level === 3) return 'Level 3';
  return 'Level 1';
}

function formatDateTime(value) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toISOString().replace('T', ' ').slice(0, 16);
}

function getPeriodValue(record, periodIndex, field) {
  const periods = record.monthly_progress || [];
  const match = periods.find((item) => Number(item.period_index) === periodIndex);
  return match?.[field] || '';
}

function buildExportColumns() {
  const baseColumns = [
    { label: 'Name', value: (record) => record.name, kind: 'text' },
    { label: 'Status', value: (record) => record.status, kind: 'status' },
    {
      label: 'Ambassador Level',
      value: (record) => displayAmbassadorLevel(record.ambassador_level),
      kind: 'text',
    },
    { label: 'Channel', value: (record) => record.channel, kind: 'text' },
    { label: 'Email', value: (record) => record.email, kind: 'text' },
    { label: 'Region', value: (record) => record.region, kind: 'text' },
    {
      label: 'Sponsored Product(s)',
      value: (record) => record.sponsored_products,
      kind: 'text',
    },
    { label: 'Affiliate Code', value: (record) => record.affiliate_code, kind: 'text' },
    { label: 'Commission', value: (record) => record.commission, kind: 'text' },
    { label: "Order #'s", value: (record) => record.order_numbers, kind: 'text' },
    {
      label: 'Required Deliverables',
      value: (record) => record.required_deliverables,
      kind: 'number',
    },
    {
      label: 'YouTube Followers',
      value: (record) => record.youtube_followers ?? 0,
      kind: 'number',
    },
    {
      label: 'Instagram Followers',
      value: (record) => record.instagram_followers ?? 0,
      kind: 'number',
    },
    {
      label: 'Facebook Followers',
      value: (record) => record.facebook_followers ?? 0,
      kind: 'number',
    },
    {
      label: 'TikTok Followers',
      value: (record) => record.tiktok_followers ?? 0,
      kind: 'number',
    },
    {
      label: 'Total Followers',
      value: (record) => record.total_followers ?? 0,
      kind: 'number',
    },
    { label: 'YouTube URL', value: (record) => record.youtube_url, kind: 'url' },
    { label: 'Instagram URL', value: (record) => record.instagram_url, kind: 'url' },
    { label: 'Facebook URL', value: (record) => record.facebook_url, kind: 'url' },
    { label: 'TikTok URL', value: (record) => record.tiktok_url, kind: 'url' },
    { label: 'Contract Status', value: (record) => record.contract_status, kind: 'text' },
    {
      label: 'Last Contacted',
      value: (record) => formatDateTime(record.last_contacted_at),
      kind: 'datetime',
    },
    {
      label: 'Next Follow-up',
      value: (record) => formatDateTime(record.next_followup_at),
      kind: 'datetime',
    },
    { label: 'Notes', value: (record) => record.notes, kind: 'text' },
  ];

  const periodColumns = [];

  for (let periodIndex = 1; periodIndex <= 5; periodIndex += 1) {
    periodColumns.push(
      {
        label: `Period ${periodIndex} Check-In`,
        value: (record) => getPeriodValue(record, periodIndex, 'monthly_check_in'),
        kind: 'text',
      },
      {
        label: `Period ${periodIndex} Content`,
        value: (record) => getPeriodValue(record, periodIndex, 'content_delivered'),
        kind: 'text',
      },
      {
        label: `Period ${periodIndex} Link`,
        value: (record) => getPeriodValue(record, periodIndex, 'link'),
        kind: 'url',
      }
    );
  }

  return [...baseColumns, ...periodColumns];
}

module.exports = {
  buildExportColumns,
  displayAmbassadorLevel,
  formatDateTime,
  getPeriodValue,
};
