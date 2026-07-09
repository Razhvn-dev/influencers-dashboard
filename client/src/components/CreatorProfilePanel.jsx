import { FormLayout, Icon, Select, TextField } from '@shopify/polaris';
import {
  CalendarIcon,
  DiscountIcon,
  EmailIcon,
  HashtagIcon,
  LinkIcon,
  LocationIcon,
  NoteIcon,
  PersonIcon,
  ShieldCheckMarkIcon,
} from '@shopify/polaris-icons';
import {
  creatorHandle,
  formatFollowupDate,
  formatLastContactLabel,
  STATUS_OPTIONS,
} from '../constants';
import CreatorSectionCard from './CreatorSectionCard';
import DateTimeField from './DateTimeField';

function cleanValue(value, fallback = 'Not set') {
  const text = String(value ?? '').trim();
  return text || fallback;
}

function channelBrandLabel(form) {
  const channel = String(form.channel ?? '').trim();
  const handle = creatorHandle(form);
  if (channel && handle && handle !== '—') return `${channel} / ${handle}`;
  if (channel) return channel;
  if (handle && handle !== '—') return handle;
  return 'Not set';
}

function ProfileRow({ icon, label, value, tone = '' }) {
  return (
    <div className="crm-detail-profile-row">
      <span className="crm-detail-profile-row__icon" aria-hidden="true">
        <Icon source={icon} />
      </span>
      <span className="crm-detail-profile-row__label">{label}</span>
      <span className={`crm-detail-profile-row__value ${tone}`.trim()}>{value}</span>
    </div>
  );
}

export default function CreatorProfilePanel({
  form,
  onChange,
  editing = false,
  onEdit,
  onDone,
}) {
  const updateField = (field) => (value) => {
    onChange({ ...form, [field]: value });
  };

  const readContent = (
    <div className="crm-detail-profile-list">
      <ProfileRow icon={EmailIcon} label="Email" value={cleanValue(form.email)} />
      <ProfileRow icon={LocationIcon} label="Location" value={cleanValue(form.region)} />
      <ProfileRow icon={HashtagIcon} label="Channel / Brand" value={channelBrandLabel(form)} />
      <ProfileRow icon={LinkIcon} label="Affiliate Code" value={cleanValue(form.affiliate_code)} />
      <ProfileRow
        icon={PersonIcon}
        label="Owner"
        value={cleanValue(form.manager_owner || 'Current User')}
      />
      <ProfileRow
        icon={ShieldCheckMarkIcon}
        label="Partnership Status"
        value={cleanValue(form.status)}
        tone="crm-detail-profile-row__value--success"
      />
      <ProfileRow
        icon={CalendarIcon}
        label="Last Contact"
        value={
          form.last_contacted_at
            ? formatLastContactLabel(new Date(form.last_contacted_at).toISOString())
            : 'Not contacted'
        }
      />
      <ProfileRow
        icon={CalendarIcon}
        label="Next Follow-up"
        value={form.next_followup_at ? formatFollowupDate(form.next_followup_at) : 'Not scheduled'}
      />
      <ProfileRow icon={CalendarIcon} label="Joined Date" value="Not set" />
      <ProfileRow icon={NoteIcon} label="Notes" value={cleanValue(form.notes)} />
    </div>
  );

  const editContent = (
    <FormLayout>
      <TextField
        label="Full Name"
        value={form.name}
        onChange={updateField('name')}
        autoComplete="name"
        requiredIndicator
      />
      <TextField
        label="Email"
        type="email"
        value={form.email}
        onChange={updateField('email')}
        autoComplete="email"
      />
      <TextField
        label="Location"
        value={form.region}
        onChange={updateField('region')}
        placeholder="e.g. US"
        autoComplete="off"
      />
      <TextField
        label="Channel / Brand"
        value={form.channel}
        onChange={updateField('channel')}
        autoComplete="off"
      />
      <TextField
        label="Affiliate Code"
        value={form.affiliate_code}
        onChange={updateField('affiliate_code')}
        autoComplete="off"
      />
      <Select
        label="Partnership Status"
        options={STATUS_OPTIONS}
        value={form.status}
        onChange={updateField('status')}
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
    </FormLayout>
  );

  return (
    <CreatorSectionCard
      title="Creator Profile"
      editing={editing}
      onEdit={onEdit}
      onDone={onDone}
      readContent={readContent}
      editContent={editContent}
    />
  );
}
