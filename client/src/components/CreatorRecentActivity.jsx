import { CreatorSectionCardShell } from './CreatorSectionCard';
import { formatFollowupDate, formatRelativeTime } from '../constants';
import { useTranslation } from '../i18n/LanguageContext.jsx';

function activityTime(value, fallback = '') {
  if (!value) return fallback;
  return formatRelativeTime(value) || formatFollowupDate(value);
}

function buildActivities(record, form, t) {
  const owner = record?.followers_verified_by || form.manager_owner || t('common.currentUser');
  const activities = [];
  const updatedAt = record?.updated_at;
  const hasNotes = Boolean(String(form.notes || '').trim());
  const hasStatus = Boolean(form.status);

  if (record?.followers_last_verified_at) {
    activities.push({
      title: t('creatorDetail.followersUpdated'),
      meta: `${activityTime(record.followers_last_verified_at)} ${t('creatorDetail.byOwner', { owner })}`,
      tone: 'blue',
      date: record.followers_last_verified_at,
    });
  }

  if (hasStatus && hasNotes && updatedAt) {
    activities.push({
      title: t('creatorDetail.notesStatusUpdated', { status: form.status }),
      meta: `${activityTime(updatedAt)} ${t('creatorDetail.byOwner', { owner })}`,
      tone: 'purple',
      date: updatedAt,
    });
  } else {
    if (hasStatus) {
      activities.push({
        title: t('creatorDetail.statusChanged', { status: form.status }),
        meta: updatedAt ? `${activityTime(updatedAt)} ${t('creatorDetail.byOwner', { owner })}` : t('creatorDetail.byOwner', { owner }),
        tone: 'blue',
        date: updatedAt || null,
      });
    }

    if (hasNotes) {
      activities.push({
        title: t('creatorDetail.notesUpdated'),
        meta: updatedAt ? `${activityTime(updatedAt)} ${t('creatorDetail.byOwner', { owner })}` : t('creatorDetail.byOwner', { owner }),
        tone: 'purple',
        date: updatedAt || null,
      });
    }
  }

  activities.push({
    title: t('creatorDetail.creatorAdded'),
    meta: record?.created_at
      ? `${formatFollowupDate(record.created_at)} ${t('creatorDetail.byOwner', { owner })}`
      : t('creatorDetail.byOwner', { owner }),
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

export default function CreatorRecentActivity({ record, form, embedded = false }) {
  const { t } = useTranslation();
  const activities = buildActivities(record, form, t);

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
    <div className="crm-detail-empty-state">{t('creatorDetail.noRecentActivity')}</div>
  );

  if (embedded) return <section className="crm-detail-supporting-section crm-detail-supporting-section--activity"><h2>{t('creatorDetail.recentChanges')}</h2>{readContent}</section>;
  return <CreatorSectionCardShell title={t('creatorDetail.recentChanges')} readContent={readContent} editContent={readContent} />;
}
