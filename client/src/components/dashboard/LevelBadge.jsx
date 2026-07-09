import { displayAmbassadorLevel, getAmbassadorLevelClass } from '../../constants';

export default function LevelBadge({ level }) {
  const label = displayAmbassadorLevel(level);

  if (label === '—') {
    return <span className="crm-table-muted">—</span>;
  }

  return (
    <span className={`crm-level-pill crm-v2-table-level-badge ${getAmbassadorLevelClass(level)}`}>
      {label}
    </span>
  );
}
