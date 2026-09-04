function cleanValue(value) {
  const trimmed = String(value ?? '').trim();
  return trimmed || null;
}

function customerLinkError() {
  const error = new Error('Field "shopify_customer_id" is required when customer account visibility is enabled');
  error.statusCode = 400;
  return error;
}

function normalizeShopifyCustomerId(value) {
  const raw = cleanValue(value);
  if (!raw) return null;

  if (/^gid:\/\/shopify\/Customer\/\d+$/.test(raw)) {
    return raw;
  }

  if (/^\d+$/.test(raw)) {
    return `gid://shopify/Customer/${raw}`;
  }

  const error = new Error('Field "shopify_customer_id" must be a Shopify Customer GID or numeric customer ID');
  error.statusCode = 400;
  throw error;
}

function normalizeBoolean(value, fallback = false) {
  if (value === undefined) return fallback;
  return value === true || value === 'true' || value === 1 || value === '1';
}

function normalizeCustomerAccountLink(input = {}, existing = {}) {
  const customerId = normalizeShopifyCustomerId(
    input.shopify_customer_id === undefined
      ? existing.shopify_customer_id
      : input.shopify_customer_id
  );
  const visible = normalizeBoolean(
    input.customer_account_visible,
    normalizeBoolean(existing.customer_account_visible)
  );

  if (visible && !customerId) {
    throw customerLinkError();
  }

  return {
    shopify_customer_id: customerId,
    customer_account_visible: customerId ? visible : false,
  };
}

function toCustomerAccountProfile(record = {}) {
  return {
    business_name: cleanValue(record.business_name),
    first_name: cleanValue(record.first_name),
    last_name: cleanValue(record.last_name),
    channel: cleanValue(record.channel),
    status: cleanValue(record.status),
    affiliate_code: cleanValue(record.affiliate_code),
    commission: cleanValue(record.commission),
    niche_category: cleanValue(record.niche_category),
    bio: cleanValue(record.bio),
  };
}

module.exports = {
  normalizeCustomerAccountLink,
  normalizeShopifyCustomerId,
  toCustomerAccountProfile,
};
