import { CreatorSectionCardShell } from './CreatorSectionCard';
import { formatFollowupDate, formatRelativeTime } from '../constants';

function activityTime(value, fallback = '') {
  if (!value) return fallback;
  return formatRelativeTime(value) || formatFollowupDate(value);
}

function buildActivities(record, form) {
  const owner = record?.followers_verified_by || form.manager_owner || 'Current User';
  const activities = [];
  const updatedAt = record?.updated_at;
  const hasNotes = Boolean(String(form.notes || '').trim());
  const hasStatus = Boolean(form.status);

  if (record?.followers_last_verified_at) {
    activities.push({
      title: 'Followers updated',
      meta: `${activityTime(record.followers_last_verified_at)} by ${owner}`,
      tone: 'blue',
      date: record.followers_last_verified_at,
    });
  }

  if (hasStatus && hasNotes && updatedAt) {
    activities.push({
      title: `Notes & status updated (${form.status})`,
      meta: `${activityTime(updatedAt)} by ${owner}`,
      tone: 'purple',
      date: updatedAt,
    });
  } else {
    if (hasStatus) {
      activities.push({
        title: `Status changed to ${form.status}`,
        meta: updatedAt ? `${activityTime(updatedAt)} by ${owner}` : `by ${owner}`,
        tone: 'blue',
        date: updatedAt || null,
      });
    }

    if (hasNotes) {
      activities.push({
        title: 'Notes updated',
        meta: updatedAt ? `${activityTime(updatedAt)} by ${owner}` : `by ${owner}`,
        tone: 'purple',
        date: updatedAt || null,
      });
    }
  }

  activities.push({
    title: 'Creator added',
    meta: record?.created_at
      ? `${formatFollowupDate(record.created_at)} by ${owner}`
      : `by ${owner}`,
    tone: 'blue',
    date: record?.created_at || null,
  });

  return activities
    .sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    })
    .slice(0, 4);
}

export default function CreatorRecentActivity({ record, form }) {
  const activities = buildActivities(record, form);

  const readContent = activities.length ? (
    <div className="crm-detail-activity-timeline">
      {activities.map((activity, index) => (
        <div className="crm-detail-activity-item" key={`${activity.title}-${index}`}>
          <span
            className={`crm-detail-activity-item__dot crm-detail-activity-item__dot--${activity.tone}`}
            aria-hidden="true"
          />
          <div>
            <p className="crm-detail-activity-item__title">{activity.title}</p>
            <p className="crm-detail-activity-item__meta">{activity.meta}</p>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="crm-detail-empty-state">No recent activity yet.</div>
  );

  return (
    <CreatorSectionCardShell title="Recent Activity" readContent={readContent} editContent={readContent} />
  );
}
