import { BlockStack, IndexTable, Text } from '@shopify/polaris';
import { formatCompactNumber, formatFollowupDate } from '../../constants';
import { translateFollowupLabel, useTranslation } from '../../i18n/LanguageContext.jsx';
import LevelBadge from '../dashboard/LevelBadge';
import StatusBadge from '../dashboard/StatusBadge';
import CreatorActivityCell from './CreatorActivityCell';
import CreatorIdentityCell from './CreatorIdentityCell';
import CreatorPlatformCell from './CreatorPlatformCell';

function FollowupCell({ record, followupEmphasis }) {
  const { t } = useTranslation();

  if (!record.next_followup_at) {
    return <span className="crm-table-muted">—</span>;
  }

  const dateLabel = formatFollowupDate(record.next_followup_at);
  const emphasisLabel = followupEmphasis?.tone
    ? translateFollowupLabel(t, followupEmphasis.label)
    : null;
  const emphasisClass =
    followupEmphasis.tone === 'critical'
      ? 'crm-followup-overdue'
      : followupEmphasis.tone === 'warning'
        ? 'crm-followup-positive'
        : 'crm-contact-primary';

  return (
    <BlockStack gap="050" className="crm-resource-followup">
      <span className={followupEmphasis?.tone ? 'crm-date-secondary' : 'crm-contact-primary'}>{dateLabel}</span>
      {followupEmphasis?.tone ? <span className={emphasisClass}>{emphasisLabel}</span> : null}
    </BlockStack>
  );
}

export default function CreatorResourceRow({
  record,
  position,
  selected,
  onNavigate,
  followupEmphasis,
}) {
  return (
    <IndexTable.Row
      id={String(record.id)}
      position={position}
      selected={selected}
      onClick={onNavigate}
      className="crm-creator-resource-row"
    >
      <IndexTable.Cell className="crm-creator-table__creator-cell">
        <CreatorIdentityCell record={record} />
      </IndexTable.Cell>
      <IndexTable.Cell className="crm-v2-table__platform-cell">
        <CreatorPlatformCell record={record} />
      </IndexTable.Cell>
      <IndexTable.Cell className="crm-v2-table__followers-cell">
        <Text as="span" className="crm-v2-followers-value">
          {formatCompactNumber(record.total_followers)}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell className="crm-v2-table__status-cell">
        <StatusBadge status={record.status} />
      </IndexTable.Cell>
      <IndexTable.Cell className="crm-v2-table__level-cell">
        <LevelBadge level={record.ambassador_level} />
      </IndexTable.Cell>
      <IndexTable.Cell className="crm-v2-table__activity-cell">
        <CreatorActivityCell record={record} />
      </IndexTable.Cell>
      <IndexTable.Cell className="crm-v2-table__followup-cell">
        <FollowupCell record={record} followupEmphasis={followupEmphasis} />
      </IndexTable.Cell>
    </IndexTable.Row>
  );
}
