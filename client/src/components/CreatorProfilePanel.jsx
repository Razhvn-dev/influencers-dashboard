import { useMemo } from 'react';
import { FormLayout, Select, TextField } from '@shopify/polaris';
import {
  EmailIcon,
  HashtagIcon,
  LinkIcon,
  LocationIcon,
  PersonIcon,
} from '@shopify/polaris-icons';
import {
  creatorHandle,
  derivePrimaryChannel,
  formatFollowupDate,
  getPrimaryChannelPlatformKey,
  MANAGER_OWNER_OPTIONS,
} from '../constants';
import CreatorSectionCard from './CreatorSectionCard';
import FieldRow from './FieldRow';

function cleanValue(value, fallback = 'Not set') {
  const text = String(value ?? '').trim();
  return text || fallback;
}

function hasDisplayValue(value) {
  const text = String(value ?? '').trim();
  return Boolean(text) && text !== 'Not set' && text !== 'Not selected' && text !== '—';
}

function shouldShowChannelBrand(form, channelLabel, primaryChannel) {
  if (!hasDisplayValue(channelLabel)) return false;
  if (channelLabel === primaryChannel) return false;

  const handle = creatorHandle(form);
  if (handle && handle !== '—') {
    const norm = (s) => String(s).toLowerCase().replace(/^@/, '');
    if (norm(channelLabel) === norm(handle)) return false;
  }

  return true;
}
function channelBrandLabel(form) {
  const channel = String(form.channel ?? '').trim();
  const handle = creatorHandle(form);
  const normalizedHandle = handle && handle !== '—' ? handle : '';

  if (channel && normalizedHandle) {
    const same =
      channel.toLowerCase() === normalizedHandle.toLowerCase() ||
      channel.toLowerCase() === normalizedHandle.replace(/^@/, '').toLowerCase();
    return same ? channel : `${channel} / ${normalizedHandle}`;
  }

  if (channel) return channel;
  if (normalizedHandle) return normalizedHandle;
  return 'Not set';
}

export default function CreatorProfilePanel({
  form,
  record,
  onChange,
  editing = false,
}) {
  const updateField = (field) => (value) => {
    onChange({ ...form, [field]: value });
  };

  const primaryChannel = derivePrimaryChannel(form);
  const primaryChannelIconKey =
    primaryChannel === 'Not selected' ? null : getPrimaryChannelPlatformKey(primaryChannel);

  const joinedDate = record?.created_at
    ? formatFollowupDate(record.created_at)
    : 'Not set';

  const readRows = useMemo(() => {
    const channelLabel = channelBrandLabel(form);
    const rows = [
      hasDisplayValue(form.email)
        ? {
            key: 'email',
            node: (
              <FieldRow
                icon={EmailIcon}
                label="Email"
                value={cleanValue(form.email)}
              />
            ),
          }
        : null,
      hasDisplayValue(form.region)
        ? {
            key: 'region',
            node: (
              <FieldRow icon={LocationIcon} label="Location" value={cleanValue(form.region)} />
            ),
          }
        : null,
      hasDisplayValue(primaryChannel) && primaryChannel !== 'Not selected'
        ? {
            key: 'primary',
            node: (
              <FieldRow
                icon={LinkIcon}
                label="Primary Channel"
                value={primaryChannel}
                platformIconKey={primaryChannelIconKey}
              />
            ),
          }
        : null,
      shouldShowChannelBrand(form, channelLabel, primaryChannel)
        ? {
            key: 'channel',
            node: (
              <FieldRow
                icon={HashtagIcon}
                label="Channel / Brand"
                value={channelLabel}
                multiline
              />
            ),
          }
        : null,
      hasDisplayValue(form.niche_category)
        ? {
            key: 'niche',
            node: (
              <FieldRow
                icon={HashtagIcon}
                label="Niche / Category"
                value={cleanValue(form.niche_category)}
              />
            ),
          }
        : null,
      hasDisplayValue(form.manager_owner)
        ? {
            key: 'manager',
            node: (
              <FieldRow
                icon={PersonIcon}
                label="Manager / Owner"
                value={cleanValue(form.manager_owner)}
              />
            ),
          }
        : null,
      hasDisplayValue(form.tags)
        ? {
            key: 'tags',
            node: (
              <FieldRow icon={HashtagIcon} label="Tags" value={cleanValue(form.tags)} multiline />
            ),
          }
        : null,
      hasDisplayValue(form.affiliate_code)
        ? {
            key: 'affiliate',
            node: (
              <FieldRow
                icon={LinkIcon}
                label="Affiliate Code"
                value={cleanValue(form.affiliate_code)}
              />
            ),
          }
        : null,
      record?.created_at
        ? {
            key: 'joined',
            node: <FieldRow icon={LinkIcon} label="Joined Date" value={joinedDate} />,
          }
        : null,
      hasDisplayValue(form.bio)
        ? {
            key: 'bio',
            node: (
              <FieldRow icon={PersonIcon} label="Bio" value={cleanValue(form.bio)} multiline />
            ),
          }
        : null,
    ].filter(Boolean);

    return rows;
  }, [form, joinedDate, primaryChannel, primaryChannelIconKey, record?.created_at]);

  const readContent =
    readRows.length > 0 ? (
      <div className="crm-field-row-list">
        {readRows.map((row) => (
          <div key={row.key}>{row.node}</div>
        ))}
      </div>
    ) : (
      <p className="crm-detail-empty-state">No profile details yet. Edit creator to add information.</p>
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
        label="Niche / Category"
        value={form.niche_category}
        onChange={updateField('niche_category')}
        autoComplete="off"
      />
      <TextField
        label="Bio"
        value={form.bio}
        onChange={updateField('bio')}
        multiline={3}
        autoComplete="off"
      />
      <Select
        label="Manager / Owner"
        options={MANAGER_OWNER_OPTIONS}
        value={form.manager_owner}
        onChange={updateField('manager_owner')}
      />
      <TextField
        label="Tags"
        value={form.tags}
        onChange={updateField('tags')}
        placeholder="e.g. VIP, Micro-influencer"
        autoComplete="off"
      />
      <TextField
        label="Affiliate Code"
        value={form.affiliate_code}
        onChange={updateField('affiliate_code')}
        autoComplete="off"
      />
    </FormLayout>
  );

  return (
    <CreatorSectionCard
      title="Creator Profile"
      editing={editing}
      readContent={readContent}
      editContent={editContent}
    />
  );
}
