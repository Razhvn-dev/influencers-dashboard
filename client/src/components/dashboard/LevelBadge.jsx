import { displayAmbassadorLevel } from '../../constants';

function levelClass(level) {
  if (level === 'Level 3') return 'crm-level-pill--3';
  if (level === 'Level 2') return 'crm-level-pill--2';
  return 'crm-level-pill--1';
}

export default function LevelBadge({ level }) {
  return (
    <span className={`crm-level-pill crm-v2-table-level-badge ${levelClass(level)}`}>
      {displayAmbassadorLevel(level)}
    </span>
  );
}
