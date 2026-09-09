const FORMULA_PREFIX = /^\s*[=+\-@]/;

function sanitizeSpreadsheetText(value) {
  const text = value == null ? '' : String(value);
  return FORMULA_PREFIX.test(text) ? `'${text}` : text;
}

module.exports = {
  sanitizeSpreadsheetText,
};
