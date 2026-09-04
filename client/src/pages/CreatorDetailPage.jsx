import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Banner,
  BlockStack,
  Box,
  Button,
  InlineStack,
  Layout,
  Modal,
  Page,
  Spinner,
  Text,
} from '@shopify/polaris';
import {
  deleteSponsorshipRecord,
  fetchSponsorshipRecord,
  updateCustomerAccountLink,
  updateSponsorshipRecord,
} from '../api';
import {
  buildFormStateFromRecord,
  buildSavePayload,
  previewAmbassadorLevel,
} from '../constants';
import CreatorDetailEditForm from '../components/CreatorDetailEditForm';
import CreatorDetailSummaryMetrics from '../components/CreatorDetailSummaryMetrics';
import CreatorMonthlyProgressSection from '../components/CreatorMonthlyProgressSection';
import CreatorNotesCard from '../components/CreatorNotesCard';
import CreatorPlatformAccounts from '../components/CreatorPlatformAccounts';
import CreatorProfileHeader from '../components/CreatorProfileHeader';
import PageBackButton from '../components/PageBackButton';
import CreatorProfilePanel from '../components/CreatorProfilePanel';
import CreatorRecentActivity from '../components/CreatorRecentActivity';
import CreatorSponsorshipDetails from '../components/CreatorSponsorshipDetails';
import CreatorDetailSupportingSurface from '../components/CreatorDetailSupportingSurface';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useTranslation } from '../i18n/LanguageContext.jsx';
import { useAutoDismiss } from '../hooks/useAutoDismiss';

const SUCCESS_DISMISS_MS = 3000;

export default function CreatorDetailPage({ localPreview = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [record, setRecord] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [leaveConfirmMode, setLeaveConfirmMode] = useState('back');

  const dismissSuccess = useCallback(() => setSuccess(''), []);
  useAutoDismiss(success, dismissSuccess, SUCCESS_DISMISS_MS);

  const loadRecord = useCallback(async () => {
    setLoading(true);
    setLoadError('');

    try {
      const data = await fetchSponsorshipRecord(id);
      setRecord(data);
      setForm(buildFormStateFromRecord(data));
      setError('');
      setIsEditing(false);
    } catch (err) {
      setRecord(null);
      setForm(null);
      setLoadError(err.message || t('creatorDetail.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadRecord();
  }, [loadRecord]);

  useEffect(() => {
    if (location.state?.success) {
      setSuccess(location.state.success);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  const savedSnapshot = useMemo(
    () => (record ? JSON.stringify(buildFormStateFromRecord(record)) : ''),
    [record]
  );
  const currentSnapshot = useMemo(() => JSON.stringify(form), [form]);
  const isDirty = Boolean(record && form && savedSnapshot !== currentSnapshot);
  const showFooter = isEditing;

  const dismissLeaveConfirm = useCallback(() => {
    setLeaveConfirmOpen(false);
  }, []);

  const resetFormToSaved = useCallback(() => {
    if (record) {
      setForm(buildFormStateFromRecord(record));
    }
    setIsEditing(false);
    setError('');
  }, [record]);

  const handleSave = async () => {
    if (!record || !form) return;

    if (!form.name.trim()) {
      setError(t('addCreator.nameRequired'));
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await updateCustomerAccountLink(record.id, {
        shopify_customer_id: form.shopify_customer_id,
        customer_account_visible: form.customer_account_visible,
      });
      const updated = await updateSponsorshipRecord(record.id, buildSavePayload(form));
      setRecord(updated);
      setForm(buildFormStateFromRecord(updated));
      setIsEditing(false);
      setSuccess(t('detail.updatedSuccess'));
    } catch (err) {
      let message = err.message || t('detail.unableToSave');

      if (message.includes('Unable to reach the app server')) {
        message = t('detail.saveNetworkError');
      } else if (message.includes('Session expired')) {
        message = t('detail.saveSessionError');
      }

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const exitEditMode = useCallback(() => {
    if (isDirty) {
      setLeaveConfirmMode('discard');
      setLeaveConfirmOpen(true);
      return;
    }

    resetFormToSaved();
  }, [isDirty, resetFormToSaved]);

  const handleBack = () => {
    if (isDirty) {
      setLeaveConfirmMode('back');
      setLeaveConfirmOpen(true);
      return;
    }

    setIsEditing(false);
    navigate('/');
  };

  const handleConfirmLeave = () => {
    setLeaveConfirmOpen(false);

    if (leaveConfirmMode === 'back') {
      resetFormToSaved();
      navigate('/');
      return;
    }

    resetFormToSaved();
  };

  const handleDeleteConfirm = async () => {
    if (!record) return;

    setDeleting(true);
    setError('');

    try {
      await deleteSponsorshipRecord(record.id);
      navigate('/', {
        state: { success: t('detail.deletedSuccess') },
      });
    } catch (err) {
      setError(err.message || t('detail.deleteFailed'));
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Page fullWidth className="crm-page crm-detail-page">
        <Layout>
          <Layout.Section>
            <Box padding="800">
              <InlineStack align="center" blockAlign="center" gap="300">
                <Spinner accessibilityLabel={t('detail.loading')} size="large" />
                <Text as="span" tone="subdued">
                  {t('detail.loading')}
                </Text>
              </InlineStack>
            </Box>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  if (loadError || !record || !form) {
    return (
      <Page fullWidth className="crm-page crm-detail-page">
        <Layout>
          <Layout.Section>
            <BlockStack gap="400">
              <Button variant="plain" onClick={() => navigate('/')} className="crm-back-link">
                {t('detail.backToDashboard')}
              </Button>
              <Banner tone="critical" title={t('detail.notFound')}>
                <p>{loadError || t('detail.notFoundBody')}</p>
              </Banner>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  const ambassadorLevel = previewAmbassadorLevel(form);

  const handleFooterCancel = () => {
    if (isDirty || isEditing) {
      exitEditMode();
      return;
    }

    handleBack();
  };

  const detailPageClassName = `crm-page crm-detail-page${showFooter ? ' crm-detail-page--footer-visible' : ''}${isEditing ? ' crm-detail-page--editing' : ''}`;

  return (
    <>
      <div className={detailPageClassName}>
      <Page fullWidth>
        <Layout>
          <Layout.Section>
            <BlockStack gap="500" className="crm-detail-stack">
              {success ? (
                <Box className="crm-detail-success-banner">
                  <Banner tone="success" onDismiss={dismissSuccess}>
                    <p>{success}</p>
                  </Banner>
                </Box>
              ) : null}

              {error ? (
                <Banner tone="critical" title={t('detail.unableToSave')}>
                  <p>{error}</p>
                </Banner>
              ) : null}

              <div className="crm-detail-page__nav">
                <PageBackButton label={t('detail.backToCreators')} onClick={handleBack} />
                <div className="crm-detail-page__nav-end">
                  <LanguageSwitcher className="crm-language-switcher" />
                  {!isEditing ? (
                    <InlineStack gap="200" wrap={false} blockAlign="center">
                      <Button
                        tone="critical"
                        onClick={() => setDeleteConfirmOpen(true)}
                        disabled={saving || deleting}
                      >
                        {t('common.delete')}
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => setIsEditing(true)}
                        disabled={saving || deleting}
                      >
                        {t('detail.editCreator')}
                      </Button>
                    </InlineStack>
                  ) : null}
                </div>
              </div>

              {!isEditing ? (
                <section className="crm-detail-hero">
                  <CreatorProfileHeader
                    form={form}
                    ambassadorLevel={ambassadorLevel}
                    onBack={handleBack}
                    onStartEdit={() => setIsEditing(true)}
                    onDelete={() => setDeleteConfirmOpen(true)}
                    isEditing={isEditing}
                    saving={saving}
                    deleting={deleting}
                    hideBack
                    hideActions
                    embeddedInHero
                    metricsSlot={<CreatorDetailSummaryMetrics form={form} layout="hero-side" />}
                  />
                </section>
              ) : (
                <CreatorProfileHeader
                  form={form}
                  ambassadorLevel={ambassadorLevel}
                  onBack={handleBack}
                  onStartEdit={() => setIsEditing(true)}
                  onDelete={() => setDeleteConfirmOpen(true)}
                  isEditing={isEditing}
                  saving={saving}
                  deleting={deleting}
                  hideBack
                />
              )}

              <Box className="crm-detail-primary-content">
                {isEditing ? (
                  <CreatorDetailEditForm
                    form={form}
                    onChange={setForm}
                    nameError={error && !form.name.trim() ? t('addCreator.nameRequired') : ''}
                  />
                ) : (
                  <Box className="crm-detail-view-layout">
                    <main className="crm-detail-view-layout__main">
                      <CreatorPlatformAccounts form={form} onChange={setForm} editing={false} />
                      <CreatorSponsorshipDetails form={form} onChange={setForm} editing={false} embedded />
                      <CreatorMonthlyProgressSection
                        periods={form.monthly_progress}
                        onChange={(monthly_progress) => setForm((current) => ({ ...current, monthly_progress }))}
                        editing={false}
                        embedded
                      />
                    </main>
                    <CreatorDetailSupportingSurface>
                      <CreatorNotesCard record={record} form={form} onChange={setForm} editing={false} embedded />
                      <CreatorProfilePanel
                        form={form}
                        record={record}
                        onChange={setForm}
                        editing={false}
                        embedded
                        onEditRequest={() => setIsEditing(true)}
                      />
                      <CreatorRecentActivity record={record} form={form} embedded />
                    </CreatorDetailSupportingSurface>
                  </Box>
                )}
              </Box>
            </BlockStack>
          </Layout.Section>
        </Layout>

        {showFooter ? (
          <Box className="crm-detail-footer">
            {isDirty ? (
              <p className="crm-detail-footer__hint">{t('detail.unsavedChangesHint')}</p>
            ) : null}
            <InlineStack gap="300" wrap={false}>
              <Button
                variant="secondary"
                className="crm-detail-footer__cancel"
                onClick={handleFooterCancel}
                disabled={deleting || saving}
              >
                {isDirty ? t('detail.discardChangesBtn') : t('detail.cancelEditing')}
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                loading={saving}
                disabled={deleting || !isDirty}
              >
                {t('detail.saveChanges')}
              </Button>
            </InlineStack>
          </Box>
        ) : null}
      </Page>
      </div>

      <Modal
        open={leaveConfirmOpen}
        onClose={dismissLeaveConfirm}
        title={
          leaveConfirmMode === 'back' ? t('detail.leaveTitle') : t('detail.discardTitle')
        }
        primaryAction={{
          content:
            leaveConfirmMode === 'back'
              ? t('detail.leaveWithoutSaving')
              : t('detail.discardChanges'),
          onAction: handleConfirmLeave,
          destructive: true,
        }}
        secondaryActions={[
          {
            content: t('detail.keepEditing'),
            onAction: dismissLeaveConfirm,
          },
        ]}
      >
        <Modal.Section>
          <Text as="p" variant="bodyMd">
            {t('detail.leaveBody')}
          </Text>
        </Modal.Section>
      </Modal>

      <Modal
        open={deleteConfirmOpen}
        onClose={() => {
          if (!deleting) {
            setDeleteConfirmOpen(false);
          }
        }}
        title={t('detail.deleteTitle')}
        primaryAction={{
          content: t('common.delete'),
          onAction: handleDeleteConfirm,
          loading: deleting,
          destructive: true,
        }}
        secondaryActions={[
          {
            content: t('common.cancel'),
            onAction: () => setDeleteConfirmOpen(false),
            disabled: deleting,
          },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="300">
            <Text as="p" variant="bodyMd">
              {t('detail.deleteBody', { name: record.name })}
            </Text>
          </BlockStack>
        </Modal.Section>
      </Modal>
    </>
  );
}
