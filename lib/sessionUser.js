function decodeJwtPayload(token) {
  if (!token) return null;

  const parts = token.split('.');
  if (parts.length < 2) return null;

  try {
    const payload = Buffer.from(parts[1], 'base64url').toString('utf8');
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

function formatAssociatedUser(user) {
  if (!user) return null;

  const name = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  if (name) return name;
  if (user.email) return user.email;
  if (user.id != null) return `Staff #${user.id}`;

  return null;
}

function formatJwtSubject(payload) {
  if (!payload?.sub) return null;

  const subject = String(payload.sub);
  const id = subject.split('/').pop();
  return id ? `Staff #${id}` : subject;
}

function getVerifiedByLabel(res) {
  const session = res.locals.shopify?.session;
  const associatedUser = session?.onlineAccessInfo?.associated_user;
  const fromSession = formatAssociatedUser(associatedUser);

  if (fromSession) {
    return fromSession;
  }

  const authHeader = res.req?.headers?.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const fromToken = formatJwtSubject(decodeJwtPayload(token));

  if (fromToken) {
    return fromToken;
  }

  if (process.env.LOCAL_DEV === 'true') {
    return 'Local Dev';
  }

  if (session?.shop) {
    return session.shop;
  }

  return 'Unknown user';
}

module.exports = {
  getVerifiedByLabel,
};
