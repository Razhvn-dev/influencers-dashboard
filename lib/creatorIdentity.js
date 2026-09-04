function cleanIdentityValue(value) {
  const trimmed = String(value ?? '').trim();
  return trimmed || null;
}

function hasOwn(source, key) {
  return Object.prototype.hasOwnProperty.call(source || {}, key);
}

function getCreatorLegalName(record = {}) {
  return [cleanIdentityValue(record.first_name), cleanIdentityValue(record.last_name)]
    .filter(Boolean)
    .join(' ');
}

function getCreatorPrimaryIdentity(record = {}) {
  return cleanIdentityValue(record.business_name) || cleanIdentityValue(record.name) || '';
}

function requiredFieldError(field) {
  const error = new Error(`Field "${field}" is required`);
  error.statusCode = 400;
  return error;
}

function normalizeCreatorIdentity(input = {}, existing = {}) {
  const businessName = cleanIdentityValue(
    hasOwn(input, 'business_name') ? input.business_name : existing.business_name
  );
  const firstName = cleanIdentityValue(
    hasOwn(input, 'first_name') ? input.first_name : existing.first_name
  );
  const lastName = cleanIdentityValue(
    hasOwn(input, 'last_name') ? input.last_name : existing.last_name
  );
  const isNew = !existing.id;
  const hasNewIdentityInput = ['business_name', 'first_name', 'last_name'].some((key) =>
    hasOwn(input, key)
  );
  const legacyName = cleanIdentityValue(hasOwn(input, 'name') ? input.name : existing.name);

  if (isNew && (hasNewIdentityInput || !legacyName)) {
    if (!businessName) throw requiredFieldError('business_name');
    if (!firstName) throw requiredFieldError('first_name');
  }

  const legalName = getCreatorLegalName({ first_name: firstName, last_name: lastName });

  return {
    business_name: businessName,
    first_name: firstName,
    last_name: lastName,
    name: legalName || legacyName,
  };
}

module.exports = {
  cleanIdentityValue,
  getCreatorLegalName,
  getCreatorPrimaryIdentity,
  normalizeCreatorIdentity,
};
