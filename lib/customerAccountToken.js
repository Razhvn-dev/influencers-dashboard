function normalizeCustomerAccountSubject(value) {
  const subject = String(value || '').trim();

  if (/^gid:\/\/shopify\/Customer\/\d+$/.test(subject)) {
    return subject;
  }

  if (/^\d+$/.test(subject)) {
    return `gid://shopify/Customer/${subject}`;
  }

  return null;
}

module.exports = { normalizeCustomerAccountSubject };
