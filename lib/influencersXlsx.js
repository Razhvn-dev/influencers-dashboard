const ExcelJS = require('exceljs');
const { buildExportColumns } = require('./influencersExport');

const HEADER_FILL = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFE8EEF7' },
};

const HEADER_FONT = {
  bold: true,
  color: { argb: 'FF1F2937' },
  size: 11,
};

const HEADER_BORDER = {
  top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
  left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
  bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
  right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
};

const STATUS_FILLS = {
  Applied: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2FE' } },
  Contacted: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } },
  'Call Scheduled': { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E7FF' } },
  'Under Review': { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } },
  Approved: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } },
  Rejected: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } },
  'Active Ambassador': { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } },
  'Past Partner': { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } },
  Partnered: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } },
};

const COLUMN_WIDTHS = {
  Name: 22,
  Status: 14,
  'Ambassador Level': 16,
  Channel: 14,
  Email: 28,
  Region: 10,
  'Sponsored Product(s)': 24,
  'Affiliate Code': 14,
  Commission: 12,
  "Order #'s": 16,
  'Required Deliverables': 18,
  'YouTube Followers': 16,
  'Instagram Followers': 18,
  'Facebook Followers': 17,
  'TikTok Followers': 15,
  'Total Followers': 15,
  'YouTube URL': 36,
  'Instagram URL': 36,
  'Facebook URL': 36,
  'TikTok URL': 36,
  'Contract Status': 16,
  'Last Contacted': 18,
  'Next Follow-up': 18,
  Notes: 32,
};

function getColumnWidth(column) {
  if (COLUMN_WIDTHS[column.label]) {
    return COLUMN_WIDTHS[column.label];
  }

  if (column.label.endsWith(' Check-In')) return 16;
  if (column.label.endsWith(' Content')) return 28;
  if (column.label.endsWith(' Link')) return 40;

  if (column.kind === 'number') return 14;
  if (column.kind === 'url') return 36;
  if (column.kind === 'datetime') return 18;

  return 16;
}

function normalizeCellValue(value, kind) {
  if (value == null || value === '') {
    return '';
  }

  if (kind === 'number') {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : value;
  }

  return value;
}

async function exportInfluencersXlsx(records) {
  const columns = buildExportColumns();
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Influencer Dashboard';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Influencers', {
    views: [{ state: 'frozen', xSplit: 3, ySplit: 1, activeCell: 'D2' }],
  });

  sheet.columns = columns.map((column) => ({
    key: column.label,
    width: getColumnWidth(column),
  }));

  const headerRow = sheet.addRow(columns.map((column) => column.label));
  headerRow.height = 24;
  headerRow.eachCell((cell) => {
    cell.font = HEADER_FONT;
    cell.fill = HEADER_FILL;
    cell.border = HEADER_BORDER;
    cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
  });

  records.forEach((record, rowIndex) => {
    const rowValues = columns.map((column) =>
      normalizeCellValue(column.value(record), column.kind)
    );
    const row = sheet.addRow(rowValues);
    const isEvenRow = rowIndex % 2 === 1;
    const rowFill = isEvenRow
      ? { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } }
      : null;

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const column = columns[colNumber - 1];
      cell.border = HEADER_BORDER;
      cell.alignment = {
        vertical: 'top',
        horizontal: column.kind === 'number' ? 'right' : 'left',
        wrapText: column.kind === 'url' || column.label === 'Notes',
      };

      if (column.kind === 'number' && typeof cell.value === 'number') {
        cell.numFmt = '#,##0';
      }

      if (column.kind === 'url' && cell.value) {
        cell.font = { color: { argb: 'FF2563EB' }, underline: true };
      }

      if (column.kind === 'status' && STATUS_FILLS[cell.value]) {
        cell.fill = STATUS_FILLS[cell.value];
      } else if (rowFill) {
        cell.fill = rowFill;
      }
    });
  });

  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: columns.length },
  };

  return workbook.xlsx.writeBuffer();
}

module.exports = {
  exportInfluencersXlsx,
};
