import { useEffect, useMemo, useState } from 'react';
import { BlockStack, FormLayout, Select, Text, TextField } from '@shopify/polaris';
import {
  getTranslatedCommissionOptions,
  getTranslatedStatusOptions,
  sanitizeFollowerInput,
} from '../constants';
import AddCreatorFormCard from './add-creator/AddCreatorFormCard';
import AdditionalDetailsSection from './add-creator/AdditionalDetailsSection';
import BasicInformationCard from './add-creator/BasicInformationCard';
import NextFollowupFields from './add-creator/NextFollowupFields';
import PlatformsCard from './add-creator/PlatformsCard';
import MonthlyProgressEditor from './MonthlyProgressEditor';
import CreatorDetailEditSummary from './CreatorDetailEditSummary';
import { useTranslation } from '../i18n/LanguageContext.jsx';

const EDIT_SECTIONS = [
  { id: 'creator-profile', labelKey: 'addCreator.basicInfo' },
  { id: 'creator-platforms', labelKey: 'addCreator.platforms' },
  { id: 'creator-partnership', labelKey: 'creatorDetail.partnershipAndFollowup' },
  { id: 'creator-details', labelKey: 'creatorCreate.addSupportingDetails' },
  { id: 'creator-monthly-progress', labelKey: 'creatorCreate.monthlyProgress' },
];

function scrollToSection(sectionId) {
  document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function CreatorDetailEditForm({ form, onChange, nameError = '' }) {
  const { t } = useTranslation();
  const [advancedSponsorshipOpen, setAdvancedSponsorshipOpen] = useState(
    Boolean(String(form.required_deliverables || '').trim())
  );

  const statusOptions = useMemo(() => getTranslatedStatusOptions(t), [t]);
  const commissionOptions = useMemo(() => getTranslatedCommissionOptions(t), [t]);
  const sectionLabels = useMemo(
    () => EDIT_SECTIONS.map((section) => ({ ...section, label: t(section.labelKey) })),
    [t]
  );
  const [activeSectionId, setActiveSectionId] = useState(EDIT_SECTIONS[0].id);

  useEffect(() => {
    const sectionElements = EDIT_SECTIONS
      .map((section) => document.getElementById(section.id))
      .filter(Boolean);

    if (!sectionElements.length) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio);

        if (visible[0]?.target?.id) {
          setActiveSectionId(visible[0].target.id);
        }
      },
      {
        root: null,
        rootMargin: '-20% 0px -55% 0px',
        threshold: [0.1, 0.35, 0.6],
      }
    );

    sectionElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  const updateField = (field) => (value) => {
    onChange({ ...form, [field]: value });
  };

  const updateFollowerField = (field) => (value) => {
    onChange({ ...form, [field]: sanitizeFollowerInput(value) });
  };

  const updateNextFollowupAt = (value) => {
    onChange({ ...form, next_followup_at: value });
  };

  return (
    <div className="crm-detail-edit-layout">
      <nav className="crm-detail-edit-nav" aria-label={t('creatorDetail.editNav')}>
        {sectionLabels.map((section) => (
          <button
            key={section.id}
            type="button"
            className={`crm-detail-edit-nav__link${
              activeSectionId === section.id ? ' crm-detail-edit-nav__link--active' : ''
            }`}
            aria-current={activeSectionId === section.id ? 'true' : undefined}
            onClick={() => scrollToSection(section.id)}
          >
            {section.label}
          </button>
        ))}
      </nav>

      <div className="crm-add-creator-v2 crm-detail-edit-form">
        <div className="crm-detail-edit-form__stack">
          <BasicInformationCard
            form={form}
            onFieldChange={updateField}
            nameError={nameError}
          />

          <PlatformsCard
            form={form}
            onFieldChange={updateField}
            onFollowerFieldChange={updateFollowerField}
          />

          <AddCreatorFormCard
            title={t('creatorDetail.partnershipAndFollowup')}
            sectionId="creator-partnership"
            className="crm-add-creator__partnership-card"
          >
            <FormLayout>
              <Select
                label={t('creatorDetail.crmFollowupStatus')}
                options={statusOptions}
                value={form.status}
                onChange={updateField('status')}
              />
              <TextField
                label={t('creatorDetail.contractStatus')}
                value={form.contract_status}
                onChange={updateField('contract_status')}
                autoComplete="off"
                placeholder={t('creatorDetail.contractPlaceholder')}
              />
              <NextFollowupFields
                value={form.next_followup_at}
                onChange={updateNextFollowupAt}
              />
            </FormLayout>
          </AddCreatorFormCard>

          <AdditionalDetailsSection
            open
            flatMode
            hideMainToggle
            hideContractStatus
            hideMonthlyProgress
            onToggle={() => {}}
            form={form}
            onFieldChange={updateField}
            commissionOptions={commissionOptions}
            advancedSponsorshipOpen={advancedSponsorshipOpen}
            onAdvancedSponsorshipToggle={() => setAdvancedSponsorshipOpen((open) => !open)}
            monthlyProgressOpen
            onMonthlyProgressToggle={() => {}}
            onMonthlyProgressChange={(monthly_progress) => onChange({ ...form, monthly_progress })}
          />

          <AddCreatorFormCard
            title={t('creatorCreate.monthlyProgress')}
            sectionId="creator-monthly-progress"
            className="crm-add-creator__monthly-progress-card"
          >
            <BlockStack gap="300">
              <Text as="p" tone="subdued" variant="bodySm">
                {t('creatorCreate.progressEditorHelp')}
              </Text>
              <MonthlyProgressEditor
                periods={form.monthly_progress}
                onChange={(monthly_progress) => onChange({ ...form, monthly_progress })}
                embedded
                checkInOptions="yesNo"
                urlVariant="icon"
              />
            </BlockStack>
          </AddCreatorFormCard>
        </div>
      </div>

      <CreatorDetailEditSummary
        form={form}
        nameError={nameError}
        onNavigate={scrollToSection}
      />
    </div>
  );
}
