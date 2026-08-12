import { displayAmbassadorLevel, getAmbassadorLevelClass } from '../../constants';
import { translateLevel, useTranslation } from '../../i18n/LanguageContext.jsx';

export default function LevelBadge({ level }) {
  const { t } = useTranslation();
  const label = displayAmbassadorLevel(level);

  if (label === '—') {
    return <span className="crm-table-muted">—</span>;
  }

  return (
    <span className={`crm-level-pill crm-v2-table-level-badge ${getAmbassadorLevelClass(level)}`}>
      {translateLevel(t, label)}
    </span>
  );
}
