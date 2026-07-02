const { buildExportColumns } = require('./influencersExport');

function escapeCsvValue(value) {
  const text = value == null ? '' : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function exportInfluencersCsv(records) {
  const columns = buildExportColumns();
  const header = columns.map((column) => escapeCsvValue(column.label)).join(',');
  const rows = records.map((record) =>
    columns.map((column) => escapeCsvValue(column.value(record))).join(',')
  );

  return `${[header, ...rows].join('\r\n')}\r\n`;
}

module.exports = {
  exportInfluencersCsv,
};
