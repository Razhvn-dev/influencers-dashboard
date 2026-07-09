import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Banner,
  BlockStack,
  Box,
  Button,
  FormLayout,
  InlineStack,
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
  MANAGER_OWNER_OPTIONS,
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
  const [form, setForm] = useState(buildEmptyCreatorForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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

  const handleCancel = () => {
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
              ← Back
            </button>
            <div className="crm-add-creator__heading">
              <h1 className="crm-add-creator__title">Add Creator</h1>
            </div>
          </div>

          <InlineStack gap="300" wrap={false} blockAlign="center" className="crm-add-creator__header-actions">
            <Button onClick={handleCancel} disabled={saving} className="crm-add-creator__btn-secondary">
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              loading={saving}
              className="crm-add-creator__btn-primary"
            >
              Save Creator
            </Button>
          </InlineStack>
        </header>

        <Banner tone="info" className="crm-add-creator__info-banner">
          <p>Add a new creator to your network. All fields can be updated later.</p>
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
                    multiline={3}
                    placeholder="Tell us about this creator..."
                    autoComplete="off"
                  />
                </FormLayout>
              </AddCreatorFormCard>

              <AddCreatorFormCard title="Sponsorship Details">
                <FormLayout>
                  <TextField
                    label="Sponsored Product(s)"
                    value={form.sponsored_products}
                    onChange={updateField('sponsored_products')}
                    multiline={3}
                    autoComplete="off"
                  />
                  <FormLayout.Group>
                    <TextField
                      label="Affiliate Code"
                      value={form.affiliate_code}
                      onChange={updateField('affiliate_code')}
                      autoComplete="off"
                    />
                    <Select
                      label="Commission"
                      options={COMMISSION_OPTIONS}
                      value={form.commission}
                      onChange={updateField('commission')}
                    />
                  </FormLayout.Group>
                  <TextField
                    label="Order #'s"
                    value={form.order_numbers}
                    onChange={updateField('order_numbers')}
                    autoComplete="off"
                  />
                  <TextField
                    label="Required Deliverables per contract"
                    value={form.required_deliverables}
                    onChange={updateField('required_deliverables')}
                    multiline={3}
                    autoComplete="off"
                  />
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
                  <FormLayout.Group>
                    <TextField
                      label="Notes"
                      value={form.notes}
                      onChange={updateField('notes')}
                      multiline={3}
                      placeholder="Internal communication notes..."
                      autoComplete="off"
                    />
                    <DateOnlyField
                      label="Last Contacted"
                      value={form.last_contacted_at}
                      onChange={updateField('last_contacted_at')}
                    />
                  </FormLayout.Group>
                  <NextFollowupFields
                    value={form.next_followup_at}
                    onChange={updateNextFollowupAt}
                  />
                </FormLayout>
              </AddCreatorFormCard>

              <AddCreatorFormCard title="Creator Profile">
                <FormLayout>
                  <div className="crm-add-creator__row-3">
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
                    <Select
                      label="Manager / Owner"
                      options={MANAGER_OWNER_OPTIONS}
                      value={form.manager_owner}
                      onChange={updateField('manager_owner')}
                    />
                  </div>
                  <TextField
                    label="Tags"
                    value={form.tags}
                    onChange={updateField('tags')}
                    placeholder="e.g. VIP, Micro-influencer"
                    autoComplete="off"
                  />
                </FormLayout>
              </AddCreatorFormCard>

              <AddCreatorFormCard title="Platforms">
                <AddCreatorPlatformTable
                  form={form}
                  onFieldChange={updateField}
                  onFollowerFieldChange={updateFollowerField}
                />
              </AddCreatorFormCard>

              <AddCreatorFormCard title="Monthly Progress (Optional)">
                <BlockStack gap="300">
                  <Text as="p" tone="subdued" variant="bodySm">
                    Fixed 5 contract periods (matches the sponsorship spreadsheet). Edit each row
                    directly — there is no add/delete row. Use Clear to reset a period, then save.
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
          <div className="crm-add-creator__footer-actions">
            <Button onClick={handleCancel} disabled={saving} className="crm-add-creator__btn-secondary">
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              loading={saving}
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
