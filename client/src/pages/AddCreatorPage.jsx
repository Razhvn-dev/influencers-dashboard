import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useBlocker, useNavigate } from 'react-router-dom';
import {
  Banner,
  BlockStack,
  Box,
  Button,
  FormLayout,
  Page,
  Select,
  Text,
  TextField,
} from '@shopify/polaris';
import { createSponsorshipRecord } from '../api';
import {
  buildEmptyCreatorForm,
  buildSavePayload,
  COMMISSION_OPTIONS,
  deriveAddCreatorPlatformPreview,
  sanitizeFollowerInput,
  STATUS_OPTIONS,
} from '../constants';
import AddCreatorFormCard from '../components/add-creator/AddCreatorFormCard';
import AddCreatorPlatformTable from '../components/add-creator/AddCreatorPlatformTable';
import AddCreatorPreviewPanel from '../components/add-creator/AddCreatorPreviewPanel';
import DateOnlyField from '../components/add-creator/DateOnlyField';
import NextFollowupFields from '../components/add-creator/NextFollowupFields';
import MonthlyProgressEditor from '../components/MonthlyProgressEditor';

export default function AddCreatorPage() {
  const navigate = useNavigate();
  const initialFormSnapshot = useRef(JSON.stringify(buildEmptyCreatorForm()));
  const [form, setForm] = useState(buildEmptyCreatorForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [advancedSponsorshipOpen, setAdvancedSponsorshipOpen] = useState(false);
  const [monthlyProgressOpen, setMonthlyProgressOpen] = useState(false);

  const isDirty = useMemo(
    () => JSON.stringify(form) !== initialFormSnapshot.current,
    [form]
  );

  const blocker = useBlocker(isDirty && !saving);

  useEffect(() => {
    if (blocker.state !== 'blocked') return;

    const shouldLeave = window.confirm(
      'You have unsaved changes. Leave this page without saving?'
    );

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
  const canSave = Boolean(form.name.trim());
  const hasPlatformSignal = platformPreview.platforms.some(
    (platform) => platform.isConnected || platform.followers > 0
  );

  const handleCancel = () => {
    if (isDirty && !window.confirm('You have unsaved changes. Leave this page without saving?')) {
      return;
    }

    navigate('/');
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('Creator name is required.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const created = await createSponsorshipRecord(buildSavePayload(form));
      navigate(`/creators/${created.id}`, {
        state: { success: 'Creator record created successfully.' },
      });
    } catch (err) {
      setError(err.message || 'Failed to create record');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Page fullWidth className="crm-page crm-add-creator">
      <Box className="crm-add-creator__shell">
        <header className="crm-add-creator__header">
          <div className="crm-add-creator__header-main">
            <button
              type="button"
              className="crm-add-creator__back"
              onClick={handleCancel}
            >
              &lt; Back
            </button>
            <div className="crm-add-creator__heading">
              <h1 className="crm-add-creator__title">Add Creator</h1>
            </div>
          </div>
        </header>

        <Banner tone="info" className="crm-add-creator__info-banner">
          <p>
            Start with a name and platform counts. Level, primary channel, and total followers
            update automatically.
          </p>
        </Banner>

        {error ? (
          <Banner tone="critical" title="Unable to save record">
            <p>{error}</p>
          </Banner>
        ) : null}

        <div className="crm-add-creator__layout">
          <div className="crm-add-creator__form-column">
            <div className="crm-add-creator__form-stack">
              <AddCreatorFormCard title="Basic Information">
                <FormLayout>
                  <FormLayout.Group>
                    <TextField
                      label="Creator Name"
                      value={form.name}
                      onChange={updateField('name')}
                      placeholder="e.g. Benjamin Kim"
                      autoComplete="name"
                      requiredIndicator
                    />
                    <TextField
                      label="Username / Handle"
                      value={form.channel}
                      onChange={updateField('channel')}
                      placeholder="e.g. @benjaminkim"
                      autoComplete="off"
                    />
                  </FormLayout.Group>
                  <TextField
                    label="Niche / Category"
                    value={form.niche_category}
                    onChange={updateField('niche_category')}
                    placeholder="e.g. Tech, Beauty, Gaming"
                    autoComplete="off"
                  />
                  <TextField
                    label="Bio"
                    value={form.bio}
                    onChange={updateField('bio')}
                    multiline={2}
                    placeholder="Tell us about this creator..."
                    autoComplete="off"
                  />
                </FormLayout>
              </AddCreatorFormCard>

              <AddCreatorFormCard
                title="Platforms"
                badge={hasPlatformSignal ? 'Connected' : 'Recommended'}
              >
                <AddCreatorPlatformTable
                  form={form}
                  onFieldChange={updateField}
                  onFollowerFieldChange={updateFollowerField}
                />
              </AddCreatorFormCard>

              <AddCreatorFormCard title="Sponsorship Details">
                <FormLayout>
                  <FormLayout.Group>
                    <TextField
                      label="Sponsored Product(s)"
                      value={form.sponsored_products}
                      onChange={updateField('sponsored_products')}
                      autoComplete="off"
                    />
                    <TextField
                      label="Affiliate Code"
                      value={form.affiliate_code}
                      onChange={updateField('affiliate_code')}
                      autoComplete="off"
                    />
                  </FormLayout.Group>
                  <FormLayout.Group>
                    <Select
                      label="Commission"
                      options={COMMISSION_OPTIONS}
                      value={form.commission}
                      onChange={updateField('commission')}
                    />
                    <TextField
                      label="Order #'s"
                      value={form.order_numbers}
                      onChange={updateField('order_numbers')}
                      autoComplete="off"
                    />
                  </FormLayout.Group>
                  <div className="crm-add-creator__section-toggle-wrap">
                    <button
                      type="button"
                      className="crm-add-creator__section-toggle"
                      onClick={() => setAdvancedSponsorshipOpen((open) => !open)}
                      aria-expanded={advancedSponsorshipOpen}
                    >
                      <span>
                        {advancedSponsorshipOpen ? 'Hide' : 'Show'} advanced sponsorship details
                      </span>
                      <span className="crm-add-creator__section-toggle-icon" aria-hidden="true">
                        {advancedSponsorshipOpen ? '-' : '+'}
                      </span>
                    </button>
                  </div>
                  {advancedSponsorshipOpen ? (
                    <TextField
                      label="Required Deliverables per contract"
                      value={form.required_deliverables}
                      onChange={updateField('required_deliverables')}
                      multiline={2}
                      autoComplete="off"
                    />
                  ) : null}
                </FormLayout>
              </AddCreatorFormCard>

              <AddCreatorFormCard title="Partnership & Communication">
                <FormLayout>
                  <FormLayout.Group>
                    <Select
                      label="Partnership Status"
                      options={STATUS_OPTIONS}
                      value={form.status}
                      onChange={updateField('status')}
                    />
                    <TextField
                      label="Contract Status"
                      value={form.contract_status}
                      onChange={updateField('contract_status')}
                      autoComplete="off"
                    />
                  </FormLayout.Group>
                  <div className="crm-add-creator__communication-grid">
                    <TextField
                      label="Notes"
                      value={form.notes}
                      onChange={updateField('notes')}
                      multiline={4}
                      placeholder="Internal communication notes..."
                      autoComplete="off"
                    />
                    <div className="crm-add-creator__communication-dates">
                      <DateOnlyField
                        label="Last Contacted"
                        value={form.last_contacted_at}
                        onChange={updateField('last_contacted_at')}
                      />
                      <NextFollowupFields
                        value={form.next_followup_at}
                        onChange={updateNextFollowupAt}
                      />
                    </div>
                  </div>
                </FormLayout>
              </AddCreatorFormCard>

              <AddCreatorFormCard title="Creator Profile">
                <FormLayout>
                  <FormLayout.Group>
                    <TextField
                      label="Email"
                      type="email"
                      value={form.email}
                      onChange={updateField('email')}
                      autoComplete="email"
                    />
                    <TextField
                      label="Region"
                      value={form.region}
                      onChange={updateField('region')}
                      placeholder="e.g. US"
                      autoComplete="off"
                    />
                  </FormLayout.Group>
                  <TextField
                    label="Tags"
                    value={form.tags}
                    onChange={updateField('tags')}
                    placeholder="e.g. VIP, Micro-influencer"
                    autoComplete="off"
                  />
                </FormLayout>
              </AddCreatorFormCard>

              <AddCreatorFormCard
                title="Monthly Progress"
                badge="Optional"
                className="crm-add-creator__card--collapsible"
                action={
                  <button
                    type="button"
                    className="crm-add-creator__section-toggle crm-add-creator__section-toggle--compact"
                    onClick={() => setMonthlyProgressOpen((open) => !open)}
                    aria-expanded={monthlyProgressOpen}
                  >
                    <span>{monthlyProgressOpen ? 'Collapse' : 'Expand'}</span>
                    <span className="crm-add-creator__section-toggle-icon" aria-hidden="true">
                      {monthlyProgressOpen ? '-' : '+'}
                    </span>
                  </button>
                }
              >
                {monthlyProgressOpen ? (
                  <BlockStack gap="300">
                    <Text as="p" tone="subdued" variant="bodySm">
                      Fixed 5 contract periods matching the sponsorship spreadsheet. Edit each row
                      directly; use Clear to reset a period.
                    </Text>
                    <MonthlyProgressEditor
                      periods={form.monthly_progress}
                      onChange={(monthly_progress) =>
                        setForm((current) => ({ ...current, monthly_progress }))
                      }
                      embedded
                      checkInOptions="yesNo"
                      urlVariant="icon"
                    />
                  </BlockStack>
                ) : (
                  <p className="crm-add-creator__collapsed-note">
                    Track five optional contract periods after the creator is added.
                  </p>
                )}
              </AddCreatorFormCard>
            </div>
          </div>

          <aside className="crm-add-creator__preview-column">
            <AddCreatorPreviewPanel
              form={form}
              platformPreview={platformPreview}
              nextFollowupAt={form.next_followup_at}
            />
          </aside>
        </div>

        <footer className="crm-add-creator__footer">
          <p className="crm-add-creator__footer-hint">
            {canSave
              ? 'Ready to save. Optional details can be refined later.'
              : 'Creator name is required to save.'}
          </p>
          <div className="crm-add-creator__footer-actions">
            <Button onClick={handleCancel} disabled={saving} className="crm-add-creator__btn-secondary">
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              loading={saving}
              disabled={!canSave || saving}
              className="crm-add-creator__btn-primary"
            >
              Save Creator
            </Button>
          </div>
        </footer>
      </Box>
    </Page>
  );
}
