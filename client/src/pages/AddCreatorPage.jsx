import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useBlocker, useNavigate } from 'react-router-dom';
import {
  Banner,
  Button,
  FormLayout,
  Page,
  Select,
} from '@shopify/polaris';
import { createSponsorshipRecord } from '../api';
import {
  buildEmptyCreatorForm,
  buildSavePayload,
  getTranslatedCommissionOptions,
  deriveAddCreatorPlatformPreview,
  sanitizeFollowerInput,
  getTranslatedStatusOptions,
} from '../constants';
import AddCreatorFormCard from '../components/add-creator/AddCreatorFormCard';
import AddCreatorPreviewPanel from '../components/add-creator/AddCreatorPreviewPanel';
import AdditionalDetailsSection from '../components/add-creator/AdditionalDetailsSection';
import BasicInformationCard from '../components/add-creator/BasicInformationCard';
import PlatformsCard from '../components/add-creator/PlatformsCard';
import CreatorCreateLayout from '../components/add-creator/CreatorCreateLayout';
import CreatorHeader from '../components/add-creator/CreatorHeader';
import NextFollowupFields from '../components/add-creator/NextFollowupFields';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useTranslation } from '../i18n/LanguageContext.jsx';

export default function AddCreatorPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const initialFormSnapshot = useRef(JSON.stringify(buildEmptyCreatorForm()));
  const [form, setForm] = useState(buildEmptyCreatorForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveAttempted, setSaveAttempted] = useState(false);
  const [advancedSponsorshipOpen, setAdvancedSponsorshipOpen] = useState(false);
  const [monthlyProgressOpen, setMonthlyProgressOpen] = useState(false);
  const [additionalDetailsOpen, setAdditionalDetailsOpen] = useState(false);

  const isDirty = useMemo(
    () => JSON.stringify(form) !== initialFormSnapshot.current,
    [form]
  );

  const blocker = useBlocker(isDirty && !saving);

  useEffect(() => {
    if (blocker.state !== 'blocked') return;

    const shouldLeave = window.confirm(t('addCreator.leaveConfirm'));

    if (shouldLeave) {
      blocker.proceed();
    } else {
      blocker.reset();
    }
  }, [blocker]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!isDirty || saving) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, saving]);

  const updateField = (field) => (value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if ((field === 'business_name' || field === 'first_name') && String(value).trim()) {
      setSaveAttempted(false);
      setError('');
    }
  };

  const updateNextFollowupAt = useCallback((value) => {
    setForm((current) => ({ ...current, next_followup_at: value }));
  }, []);

  if (import.meta.env.DEV && typeof window !== 'undefined') {
    window.__crmSetFollowup = updateNextFollowupAt;
    window.__crmGetFollowup = () => form.next_followup_at;
  }

  const updateFollowerField = (field) => (value) => {
    setForm((current) => ({ ...current, [field]: sanitizeFollowerInput(value) }));
  };

  const platformPreview = deriveAddCreatorPlatformPreview(form);
  const statusOptions = useMemo(() => getTranslatedStatusOptions(t), [t]);
  const commissionOptions = useMemo(() => getTranslatedCommissionOptions(t), [t]);
  const canSave = Boolean(form.business_name.trim() && form.first_name.trim());
  const nameError = saveAttempted && !canSave ? t('addCreator.nameRequired') : '';

  const handleCancel = () => {
    if (isDirty && !window.confirm(t('creatorCreate.cancelConfirm'))) {
      return;
    }

    navigate('/');
  };

  const handleSave = async () => {
    if (!form.business_name.trim() || !form.first_name.trim()) {
      setSaveAttempted(true);
      setError(t('addCreator.nameRequired'));
      return;
    }

    setSaving(true);
    setError('');

    try {
      const created = await createSponsorshipRecord(buildSavePayload(form));
      navigate(`/creators/${created.id}`, {
        state: { success: t('creatorCreate.createdSuccess') },
      });
    } catch (err) {
      setError(err.message || t('creatorCreate.createFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Page fullWidth className="crm-page crm-add-creator">
      <div className="crm-add-creator-v2 crm-add-creator-v2__container">
        <CreatorHeader
          backLabel={t('detail.backToCreators')}
          title={t('addCreator.title')}
          onBack={handleCancel}
          actions={<LanguageSwitcher className="crm-language-switcher" />}
        />

        {error ? (
          <Banner tone="critical" title={t('addCreator.unableToSave')}>
            <p>{error}</p>
          </Banner>
        ) : null}

        <CreatorCreateLayout
          sidebar={(
            <AddCreatorPreviewPanel
              form={form}
              platformPreview={platformPreview}
              nextFollowupAt={form.next_followup_at}
            />
          )}
        >
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
            title={t('creatorCreate.partnershipFollowup')}
            sectionId="creator-partnership"
            className="crm-add-creator__partnership-card"
          >
            <FormLayout>
              <Select
                label={t('creatorCreate.partnershipStatus')}
                options={statusOptions}
                value={form.status}
                onChange={updateField('status')}
              />
              <NextFollowupFields
                value={form.next_followup_at}
                onChange={updateNextFollowupAt}
              />
            </FormLayout>
          </AddCreatorFormCard>

          <AdditionalDetailsSection
            open={additionalDetailsOpen}
            onToggle={() => setAdditionalDetailsOpen((open) => !open)}
            form={form}
            onFieldChange={updateField}
            commissionOptions={commissionOptions}
            advancedSponsorshipOpen={advancedSponsorshipOpen}
            onAdvancedSponsorshipToggle={() => setAdvancedSponsorshipOpen((open) => !open)}
            monthlyProgressOpen={monthlyProgressOpen}
            onMonthlyProgressToggle={() => setMonthlyProgressOpen((open) => !open)}
            onMonthlyProgressChange={(monthly_progress) =>
              setForm((current) => ({ ...current, monthly_progress }))
            }
          />
        </CreatorCreateLayout>

        <footer className="crm-add-creator__footer">
          <div className="crm-add-creator__footer-actions">
            {!canSave ? (
              <p className="crm-add-creator__footer-hint">{t('addCreator.nameRequiredHint')}</p>
            ) : null}
            <Button onClick={handleCancel} disabled={saving} className="crm-add-creator__btn-secondary">
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              loading={saving}
              disabled={!canSave || saving}
              className="crm-add-creator__btn-primary"
            >
              {t('addCreator.saveCreator')}
            </Button>
          </div>
        </footer>
      </div>
    </Page>
  );
}
