import { FormLayout, Select, TextField } from '@shopify/polaris';
import {
  formatFollowupDate,
  formatRelativeTime,
  getTranslatedStatusOptions,
} from '../constants';
import CreatorSectionCard from './CreatorSectionCard';
import CreatorCommunicationSummary from './CreatorCommunicationSummary';
import DateTimeField from './DateTimeField';
import { useTranslation } from '../i18n/LanguageContext.jsx';

export default function CreatorNotesCard({
  form,
  record = null,
  onChange,
  editing = false,
  embedded = false,
}) {
  const { t } = useTranslation();
  const updateField = (field) => (value) => {
    onChange({ ...form, [field]: value });
  };

  const updatedAt = record?.updated_at || record?.followers_last_verified_at || record?.last_contacted_at;
  const updatedLabel = updatedAt ? formatRelativeTime(updatedAt) : t('common.notSet');
  const updatedBy = record?.followers_verified_by || form.manager_owner || t('common.currentUser');

  const readContent = (
    <CreatorCommunicationSummary
      notes={form.notes}
      lastContact={
        form.last_contacted_at
          ? formatFollowupDate(form.last_contacted_at)
          : t('common.notSet')
      }
    />
  );

  const editContent = (
    <FormLayout>
      <Select
        label={t('dashboard.columns.status')}
        options={getTranslatedStatusOptions(t)}
        value={form.status}
        onChange={updateField('status')}
      />
      <TextField
        label={t('creatorDetail.notes')}
        value={form.notes}
        onChange={updateField('notes')}
        multiline={5}
        autoComplete="off"
      />
      <DateTimeField
        label={t('creatorDetail.lastContacted')}
        value={form.last_contacted_at}
        onChange={updateField('last_contacted_at')}
      />
      <DateTimeField
        label={t('creatorDetail.nextFollowup')}
        value={form.next_followup_at}
        onChange={updateField('next_followup_at')}
      />
      <p className="crm-detail-card-footnote">{t('creatorDetail.lastUpdated', { updated: updatedLabel, owner: updatedBy })}</p>
    </FormLayout>
  );

  if (embedded && !editing) {
    return (
      <section className="crm-detail-supporting-section crm-detail-supporting-section--communication">
        <h2>{t('creatorDetail.communication')}</h2>
        {readContent}
      </section>
    );
  }

  return (
    <CreatorSectionCard
      title={editing ? t('creatorDetail.communicationStatus') : t('creatorDetail.communication')}
      editing={editing}
      readContent={readContent}
      editContent={editContent}
    />
  );
}
