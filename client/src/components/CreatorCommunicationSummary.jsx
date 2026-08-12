import { useTranslation } from '../i18n/LanguageContext.jsx';

export default function CreatorCommunicationSummary({ notes, lastContact }) {
  const { t } = useTranslation();
  const hasNotes = Boolean(String(notes ?? '').trim());

  return (
    <dl className="crm-detail-supporting-fields">
      <div className="crm-detail-supporting-fields__item crm-detail-supporting-fields__item--stacked">
        <dt>{t('creatorDetail.notes')}</dt>
        <dd className={hasNotes ? '' : 'crm-detail-supporting-fields__empty'}>
          {hasNotes ? notes : t('creatorDetail.noCommunicationNotes')}
        </dd>
      </div>
      <div className="crm-detail-supporting-fields__item">
        <dt>{t('creatorDetail.lastContacted')}</dt>
        <dd>{lastContact}</dd>
      </div>
    </dl>
  );
}
