const AVATAR_BG_COLORS = ['#DBEAFE', '#DCFCE7', '#FCE7F3', '#FEF3C7', '#FEE2E2', '#E5E7EB'];

function getTableAvatarInitials(name, emptyInitials = '?') {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return emptyInitials;
  }

  if (parts.length === 1) {
    return (parts[0][0] || '?').toUpperCase();
  }

  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
}

function getAvatarBackground(name) {
  const value = String(name || '').trim();

  if (!value) {
    return '#E5E7EB';
  }

  let hash = 0;

  for (let i = 0; i < value.length; i += 1) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }

  return AVATAR_BG_COLORS[Math.abs(hash) % AVATAR_BG_COLORS.length];
}

function getCreatorAvatarUrl(record) {
  const candidate =
    record?.avatar_url ||
    record?.avatar ||
    record?.profile_image_url ||
    record?.photo_url ||
    '';

  return typeof candidate === 'string' && candidate.trim() ? candidate.trim() : '';
}

export default function CreatorTableAvatar({ record, emptyInitials, className = '' }) {
  const avatarUrl = getCreatorAvatarUrl(record);
  const initials = getTableAvatarInitials(record?.name, emptyInitials);
  const background = getAvatarBackground(record?.name);
  const avatarClassName = ['crm-v2-creator-avatar', className].filter(Boolean).join(' ');

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className={`${avatarClassName} crm-v2-creator-avatar--image`.trim()}
        aria-hidden="true"
      />
    );
  }

  return (
    <span
      className={`${avatarClassName} crm-v2-creator-avatar--initials`.trim()}
      style={{ background }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
