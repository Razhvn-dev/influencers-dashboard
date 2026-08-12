import { useMemo } from 'react';
import { useTranslation } from '../i18n/LanguageContext.jsx';

export default function CreatorDetailEditSummary({ form, nameError = '', onNavigate }) {
  const { t } = useTranslation();

  const items = useMemo(() => {
    const warnings = [];
    const tips = [];

    if (nameError || !String(form.name || '').trim()) {
      warnings.push({
        id: 'name',
        text: t('addCreator.nameRequired'),
        sectionId: 'creator-profile',
      });
    }

    if (!String(form.email || '').trim()) {
      tips.push({
        id: 'email',
        text: t('creatorDetail.editTipEmail'),
        sectionId: 'creator-details',
      });
    }

    if (!String(form.notes || '').trim()) {
      tips.push({
        id: 'notes',
        text: t('creatorDetail.editTipNotes'),
        sectionId: 'creator-details',
      });
    }

    if (!form.next_followup_at) {
      tips.push({
        id: 'followup',
        text: t('creatorDetail.editTipFollowup'),
        sectionId: 'creator-partnership',
      });
    }

    return { warnings, tips };
  }, [form, nameError, t]);

  const hasWarnings = items.warnings.length > 0;

  const handleNavigate = (sectionId) => {
    if (sectionId && onNavigate) {
      onNavigate(sectionId);
    }
  };

  return (
    <aside className="crm-detail-edit-summary" aria-label={t('creatorDetail.editChecklist')}>
      <h2 className="crm-detail-edit-summary__title">{t('creatorDetail.editChecklist')}</h2>

      {hasWarnings ? (
        <ul className="crm-detail-edit-summary__warnings">
          {items.warnings.map((warning) => (
            <li key={warning.id}>
              <button
                type="button"
                className="crm-detail-edit-summary__item crm-detail-edit-summary__item--warning"
                onClick={() => handleNavigate(warning.sectionId)}
              >
                {warning.text}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="crm-detail-edit-summary__ok">{t('creatorDetail.editChecklistOk')}</p>
      )}

      {items.tips.length ? (
        <div className="crm-detail-edit-summary__tips">
          <p className="crm-detail-edit-summary__tips-title">{t('creatorDetail.editTipsTitle')}</p>
          <ul>
            {items.tips.map((tip) => (
              <li key={tip.id}>
                <button
                  type="button"
                  className="crm-detail-edit-summary__item crm-detail-edit-summary__item--tip"
                  onClick={() => handleNavigate(tip.sectionId)}
                >
                  {tip.text}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </aside>
  );
}
