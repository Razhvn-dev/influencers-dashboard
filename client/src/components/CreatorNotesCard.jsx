import { FormLayout, Select, TextField } from '@shopify/polaris';
import {
  formatFollowupDate,
  formatLastContactLabel,
  formatRelativeTime,
  STATUS_OPTIONS,
} from '../constants';
import CreatorSectionCard from './CreatorSectionCard';
import DateTimeField from './DateTimeField';
import FieldRow from './FieldRow';

function notePreview(value) {
  const text = String(value ?? '').trim();
  return text || 'No notes yet.';
}

function formatFollowupRead(value) {
  if (!value) return 'Not scheduled';
  return formatFollowupDate(new Date(value).toISOString());
}

export default function CreatorNotesCard({
  form,
  record = null,
  onChange,
  editing = false,
}) {
  const updateField = (field) => (value) => {
    onChange({ ...form, [field]: value });
  };

  const updatedAt = record?.updated_at || record?.followers_last_verified_at || record?.last_contacted_at;
  const updatedLabel = updatedAt ? formatRelativeTime(updatedAt) : 'Not updated yet';
  const updatedBy = record?.followers_verified_by || form.manager_owner || 'Current User';

  const readContent = (
    <div className="crm-field-row-list">
      <FieldRow label="Notes" value={notePreview(form.notes)} multiline />
      <FieldRow
        label="Last Contact"
        value={formatLastContactLabel(
          form.last_contacted_at ? new Date(form.last_contacted_at).toISOString() : null
        )}
        muted={!form.last_contacted_at}
      />
      <FieldRow
        label="Next Follow-up"
        value={formatFollowupRead(form.next_followup_at)}
        muted={!form.next_followup_at}
      />
    </div>
  );

  const editContent = (
    <FormLayout>
      <Select
        label="Status"
        options={STATUS_OPTIONS}
        value={form.status}
        onChange={updateField('status')}
      />
      <TextField
        label="Notes"
        value={form.notes}
        onChange={updateField('notes')}
        multiline={5}
        autoComplete="off"
      />
      <DateTimeField
        label="Last Contact"
        value={form.last_contacted_at}
        onChange={updateField('last_contacted_at')}
      />
      <DateTimeField
        label="Next Follow-up"
        value={form.next_followup_at}
        onChange={updateField('next_followup_at')}
      />
      <p className="crm-detail-card-footnote">Last updated: {updatedLabel} by {updatedBy}</p>
    </FormLayout>
  );

  return (
    <CreatorSectionCard
      title={editing ? 'Notes & Status' : 'Notes'}
      editing={editing}
      readContent={readContent}
      editContent={editContent}
    />
  );
}
