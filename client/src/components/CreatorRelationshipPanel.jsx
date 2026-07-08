import {
  Badge,
  BlockStack,
  Box,
  FormLayout,
  InlineGrid,
  Select,
  Text,
  TextField,
} from '@shopify/polaris';
import {
  COMMISSION_OPTIONS,
  displayAmbassadorLevel,
  formatFollowupDate,
  formatLastContactLabel,
  getFollowupEmphasis,
  levelTone,
  STATUS_OPTIONS,
  statusTone,
} from '../constants';
import CreatorInfoRow from './CreatorInfoRow';
import CreatorSectionCard from './CreatorSectionCard';
import DateTimeField from './DateTimeField';

function followupEmphasisClassName(emphasis) {
  if (!emphasis?.tone) return 'crm-relationship-date';
  if (emphasis.tone === 'critical') return 'crm-followup-overdue';
  if (emphasis.tone === 'success') return 'crm-followup-positive';
  if (emphasis.tone === 'warning') return 'crm-followup-soon';
  return 'crm-relationship-date';
}

export default function CreatorRelationshipPanel({
  form,
  onChange,
  ambassadorLevel,
  editing = false,
  onEdit,
  onDone,
}) {
  const updateField = (field) => (value) => {
    onChange({ ...form, [field]: value });
  };

  const followupEmphasis = getFollowupEmphasis(
    form.next_followup_at ? new Date(form.next_followup_at).toISOString() : null
  );

  const readContent = (
    <BlockStack gap="500">
      <InlineGrid columns={{ xs: 1, sm: 2 }} gap="500" className="crm-relationship-badges">
        <Box className="crm-relationship-badge-item">
          <Text as="p" variant="bodySm" tone="subdued">
            Status
          </Text>
          <Box paddingBlockStart="200">
            {form.status ? (
              <Badge tone={statusTone(form.status)} size="large">
                {form.status}
              </Badge>
            ) : (
              <Text as="p">—</Text>
            )}
          </Box>
        </Box>

        <Box className="crm-relationship-badge-item">
          <Text as="p" variant="bodySm" tone="subdued">
            Ambassador Level
          </Text>
          <Box paddingBlockStart="200">
            <Badge tone={levelTone(ambassadorLevel)} size="large">
              {displayAmbassadorLevel(ambassadorLevel)}
            </Badge>
          </Box>
        </Box>
      </InlineGrid>

      <Box className="crm-info-list">
        <CreatorInfoRow label="Commission" value={form.commission || '—'} emphasize />
        <CreatorInfoRow label="Contract" value={form.contract_status} />
        <CreatorInfoRow
          label="Last Contact"
          value={formatLastContactLabel(
            form.last_contacted_at ? new Date(form.last_contacted_at).toISOString() : null
          )}
          emphasize
        />
        <div className="crm-info-row crm-info-row--inline">
          <Text as="p" variant="bodySm" tone="subdued" className="crm-info-row__label">
            Next Follow-up
          </Text>
          <BlockStack gap="100" className="crm-info-row__value">
            {form.next_followup_at ? (
              <>
                <Text
                  as="p"
                  variant="bodyMd"
                  fontWeight="semibold"
                  className={followupEmphasisClassName(followupEmphasis)}
                >
                  {followupEmphasis?.label || formatFollowupDate(form.next_followup_at)}
                </Text>
                {followupEmphasis?.tone ? (
                  <Text as="p" variant="bodySm" tone="subdued">
                    {formatFollowupDate(form.next_followup_at)}
                  </Text>
                ) : null}
              </>
            ) : (
              <Text as="p" variant="bodyMd" fontWeight="medium">
                —
              </Text>
            )}
          </BlockStack>
        </div>
      </Box>
    </BlockStack>
  );

  const editContent = (
    <FormLayout>
      <Select
        label="Status"
        options={STATUS_OPTIONS}
        value={form.status}
        onChange={updateField('status')}
      />

      <BlockStack gap="150">
        <Text as="p" variant="bodySm">
          Ambassador Level
        </Text>
        <Badge tone={levelTone(ambassadorLevel)}>
          {displayAmbassadorLevel(ambassadorLevel)}
        </Badge>
        <Text as="p" tone="subdued" variant="bodySm">
          Auto-calculated from follower counts
        </Text>
      </BlockStack>

      <Select
        label="Commission"
        options={COMMISSION_OPTIONS}
        value={form.commission}
        onChange={updateField('commission')}
      />

      <TextField
        label="Contract"
        value={form.contract_status}
        onChange={updateField('contract_status')}
        autoComplete="off"
        placeholder="Contract status or signed date"
      />

      <DateTimeField
        label="Last Contact"
        value={form.last_contacted_at}
        onChange={updateField('last_contacted_at')}
        helpText="When you last reached out to this creator"
      />

      <DateTimeField
        label="Next Follow-up"
        value={form.next_followup_at}
        onChange={updateField('next_followup_at')}
        helpText="Used for the Due for follow-up filter (within 7 days)"
      />
    </FormLayout>
  );

  return (
    <CreatorSectionCard
      title="Relationship"
      editing={editing}
      onEdit={onEdit}
      onDone={onDone}
      readContent={readContent}
      editContent={editContent}
    />
  );
}
