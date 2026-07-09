import { FormLayout, Select, TextField } from '@shopify/polaris';
import { formatRelativeTime, STATUS_OPTIONS } from '../constants';
import CreatorSectionCard from './CreatorSectionCard';

function notePreview(value) {
  const text = String(value ?? '').trim();
  return text || 'No notes yet.';
}

export default function CreatorNotesCard({
  form,
  record = null,
  onChange,
  editing = false,
  onEdit,
  onDone,
}) {
  const updateField = (field) => (value) => {
    onChange({ ...form, [field]: value });
  };

  const updatedAt = record?.updated_at || record?.followers_last_verified_at || record?.last_contacted_at;
  const updatedLabel = updatedAt ? formatRelativeTime(updatedAt) : 'Not updated yet';
  const updatedBy = record?.followers_verified_by || form.manager_owner || 'Current User';

  const readContent = (
    <div className="crm-detail-notes">
      <label className="crm-detail-field-label" htmlFor="crm-detail-status-read">
        Status
      </label>
      <div id="crm-detail-status-read" className="crm-detail-status-display">
        {form.status || 'Not set'}
      </div>

      <label className="crm-detail-field-label" htmlFor="crm-detail-notes-read">
        Notes
      </label>
      <div id="crm-detail-notes-read" className="crm-detail-note-preview">
        {notePreview(form.notes)}
      </div>

      <p className="crm-detail-card-footnote">Last updated: {updatedLabel} by {updatedBy}</p>
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
      <p className="crm-detail-card-footnote">Last updated: {updatedLabel} by {updatedBy}</p>
    </FormLayout>
  );

  return (
    <CreatorSectionCard
      title="Notes & Status"
      editing={editing}
      onEdit={onEdit}
      onDone={onDone}
      readContent={readContent}
      editContent={editContent}
    />
  );
}
