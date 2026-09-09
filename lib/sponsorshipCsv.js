const SPONSORSHIP_EXPORT_HEADER =
  "Name,Channel,Sponsored Product (s),Affiliate Code ,Commission ,Order #'s,Required Deliverables per contract,Monthly Check-In,Content Delivered ,Link ,Monthly Check-In,Content Delivered,Link ,Content Delivered,Monthly Check-In,Content Delivered,Link ,Content Delivered";
const { sanitizeSpreadsheetText } = require('./spreadsheetSafety');

const PERIOD_COLUMN_MAP = [
  { checkIn: 7, content: 8, link: 9 },
  { checkIn: 10, content: 11, link: 12 },
  { checkIn: null, content: 13, link: null },
  { checkIn: 14, content: 15, link: 16 },
  { checkIn: null, content: 17, link: null },
];

function parseCsvRows(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === ',') {
      row.push(field);
      field = '';
      continue;
    }

    if (!inQuotes && (char === '\n' || char === '\r')) {
      if (char === '\r' && next === '\n') {
        i += 1;
      }
      row.push(field);
      if (row.some((cell) => String(cell).trim() !== '')) {
        rows.push(row);
      }
      row = [];
      field = '';
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((cell) => String(cell).trim() !== '')) {
      rows.push(row);
    }
  }

  return rows;
}

function cleanCell(value) {
  const trimmed = String(value ?? '').trim();
  return trimmed === '' ? null : trimmed;
}

function parseMonthlyProgress(cells) {
  return PERIOD_COLUMN_MAP.map((mapping, index) => ({
    period_index: index + 1,
    monthly_check_in:
      mapping.checkIn == null ? null : cleanCell(cells[mapping.checkIn]),
    content_delivered:
      mapping.content == null ? null : cleanCell(cells[mapping.content]),
    link: mapping.link == null ? null : cleanCell(cells[mapping.link]),
  }));
}

function rowToSponsorshipRecord(cells) {
  if (!cells.length || !cleanCell(cells[0])) {
    return null;
  }

  return {
    name: cleanCell(cells[0]),
    channel: cleanCell(cells[1]),
    sponsored_products: cleanCell(cells[2]),
    affiliate_code: cleanCell(cells[3]),
    commission: cleanCell(cells[4]),
    order_numbers: cleanCell(cells[5]),
    required_deliverables: cleanCell(cells[6]),
    monthly_progress: parseMonthlyProgress(cells),
  };
}

function parseSponsorshipCsv(text) {
  const rows = parseCsvRows(text);

  if (rows.length === 0) {
    return [];
  }

  const firstCell = String(rows[0][0] || '').trim().toLowerCase();
  const dataRows = firstCell === 'name' ? rows.slice(1) : rows;

  return dataRows.map(rowToSponsorshipRecord).filter(Boolean);
}

function escapeCsvValue(value) {
  const text = sanitizeSpreadsheetText(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function sponsorshipRecordToCsvCells(record) {
  const cells = new Array(18).fill('');

  cells[0] = record.name || '';
  cells[1] = record.channel || '';
  cells[2] = record.sponsored_products || '';
  cells[3] = record.affiliate_code || '';
  cells[4] = record.commission || '';
  cells[5] = record.order_numbers || '';
  cells[6] = record.required_deliverables || '';

  for (const period of record.monthly_progress || []) {
    const mapping = PERIOD_COLUMN_MAP[period.period_index - 1];
    if (!mapping) continue;

    if (mapping.checkIn != null) {
      cells[mapping.checkIn] = period.monthly_check_in || '';
    }
    if (mapping.content != null) {
      cells[mapping.content] = period.content_delivered || '';
    }
    if (mapping.link != null) {
      cells[mapping.link] = period.link || '';
    }
  }

  return cells;
}

function exportSponsorshipCsv(records) {
  const lines = [
    SPONSORSHIP_EXPORT_HEADER,
    ...records.map((record) =>
      sponsorshipRecordToCsvCells(record).map(escapeCsvValue).join(',')
    ),
  ];

  return `${lines.join('\r\n')}\r\n`;
}

function emptyMonthlyProgress() {
  return Array.from({ length: 5 }, (_, index) => ({
    period_index: index + 1,
    monthly_check_in: null,
    content_delivered: null,
    link: null,
  }));
}

module.exports = {
  SPONSORSHIP_EXPORT_HEADER,
  PERIOD_COLUMN_MAP,
  parseSponsorshipCsv,
  exportSponsorshipCsv,
  emptyMonthlyProgress,
  cleanCell,
};
