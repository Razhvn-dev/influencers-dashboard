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

function normalizeCustomerAccountDestination(destination) {
  if (typeof destination !== 'string') return null;

  const value = destination.trim();
  if (!value) return null;

  try {
    return new URL(value).hostname || null;
  } catch {
    // Customer Account session tokens can represent `dest` as a shop domain
    // without a URL scheme. Parse that form as HTTPS rather than rejecting a
    // genuine Shopify-issued token.
    try {
      return new URL(`https://${value}`).hostname || null;
    } catch {
      return null;
    }
  }
}

module.exports = {
  normalizeCustomerAccountSubject,
  normalizeCustomerAccountDestination,
};
