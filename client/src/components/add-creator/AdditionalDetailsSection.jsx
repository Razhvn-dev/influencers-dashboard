import { BlockStack, Collapsible, FormLayout, Select, Text, TextField } from '@shopify/polaris';
import { useState } from 'react';
import DateOnlyField from './DateOnlyField';
import MonthlyProgressEditor from '../MonthlyProgressEditor';
import { getTranslatedManagerOwnerOptions } from '../../constants';
import { useTranslation } from '../../i18n/LanguageContext.jsx';

function DetailsSubsection({ title, badge = null, open, onToggle, children, flat = false }) {
  if (flat) {
    return (
      <div className="crm-add-creator__details-section crm-add-creator__details-section--flat">
        <h3 className="crm-add-creator__details-section-title">{title}</h3>
        {badge ? <span className="crm-add-creator__card-badge">{badge}</span> : null}
        <div className="crm-add-creator__details-subsection-body">{children}</div>
      </div>
    );
  }

  return (
    <div className="crm-add-creator__details-section">
      <button
        type="button"
        className="crm-add-creator__details-subsection-toggle"
        onClick={onToggle}
        aria-expanded={open}
      >
        <span className="crm-add-creator__details-section-title">{title}</span>
        {badge ? <span className="crm-add-creator__card-badge">{badge}</span> : null}
        <span className="crm-add-creator__details-subsection-icon" aria-hidden="true">
          {open ? '−' : '+'}
        </span>
      </button>
      <Collapsible open={open}>
        <div className="crm-add-creator__details-subsection-body">{children}</div>
      </Collapsible>
    </div>
  );
}

export default function AdditionalDetailsSection({
  open,
  onToggle,
  hideMainToggle = false,
  startCommunicationOpen = false,
  startProfileOpen = false,
  flatMode = false,
  hideContractStatus = false,
  hideMonthlyProgress = false,
  form,
  onFieldChange,
  commissionOptions,
  advancedSponsorshipOpen,
  onAdvancedSponsorshipToggle,
  monthlyProgressOpen,
  onMonthlyProgressToggle,
  onMonthlyProgressChange,
}) {
  const { t } = useTranslation();
  const managerOwnerOptions = getTranslatedManagerOwnerOptions(t);
  const [communicationOpen, setCommunicationOpen] = useState(startCommunicationOpen);
  const [profileOpen, setProfileOpen] = useState(startProfileOpen);

  const communicationSection = (
    <DetailsSubsection
      title={t('creatorCreate.communication')}
      open={flatMode ? true : communicationOpen}
      flat={flatMode}
      onToggle={() => setCommunicationOpen((value) => !value)}
    >
      <FormLayout>
        {hideContractStatus ? null : (
          <TextField
            label={t('creatorCreate.contractStatus')}
            value={form.contract_status}
            onChange={onFieldChange('contract_status')}
            autoComplete="off"
          />
        )}
        <div className="crm-add-creator__communication-grid">
          <TextField
            label={t('creatorCreate.notes')}
            value={form.notes}
            onChange={onFieldChange('notes')}
            multiline={4}
            placeholder={t('creatorCreate.notesPlaceholder')}
            autoComplete="off"
          />
          <DateOnlyField
            label={t('creatorCreate.lastContacted')}
            value={form.last_contacted_at}
            onChange={onFieldChange('last_contacted_at')}
          />
        </div>
      </FormLayout>
    </DetailsSubsection>
  );

  const commercialSection = (
    <div className="crm-add-creator__details-section crm-add-creator__details-section--static">
      <h3 className="crm-add-creator__details-section-title">{t('creatorCreate.commercialDetails')}</h3>
      <FormLayout>
        <FormLayout.Group>
          <TextField
            label={t('creatorCreate.sponsoredProducts')}
            value={form.sponsored_products}
            onChange={onFieldChange('sponsored_products')}
            autoComplete="off"
          />
          <TextField
            label={t('creatorCreate.affiliateCode')}
            value={form.affiliate_code}
            onChange={onFieldChange('affiliate_code')}
            autoComplete="off"
          />
        </FormLayout.Group>
        <FormLayout.Group>
          <Select
            label={t('creatorCreate.commission')}
            options={commissionOptions}
            value={form.commission}
            onChange={onFieldChange('commission')}
          />
          <TextField
            label={t('creatorCreate.orderNumbers')}
            value={form.order_numbers}
            onChange={onFieldChange('order_numbers')}
            autoComplete="off"
          />
        </FormLayout.Group>
        <button
          type="button"
          className="crm-add-creator__section-toggle"
          onClick={onAdvancedSponsorshipToggle}
          aria-expanded={advancedSponsorshipOpen}
        >
          <span>
            {advancedSponsorshipOpen
              ? t('creatorCreate.hideAdvancedSponsorship')
              : t('creatorCreate.showAdvancedSponsorship')}
          </span>
          <span className="crm-add-creator__section-toggle-icon" aria-hidden="true">
            {advancedSponsorshipOpen ? '-' : '+'}
          </span>
        </button>
        {advancedSponsorshipOpen ? (
          <TextField
            label={t('creatorCreate.requiredDeliverables')}
            value={form.required_deliverables}
            onChange={onFieldChange('required_deliverables')}
            multiline={2}
            autoComplete="off"
          />
        ) : null}
      </FormLayout>
    </div>
  );

  const profileSection = (
    <DetailsSubsection
      title={t('creatorCreate.creatorProfile')}
      open={flatMode ? true : profileOpen}
      flat={flatMode}
      onToggle={() => setProfileOpen((value) => !value)}
    >
      <FormLayout>
        <FormLayout.Group>
          <TextField
            label={t('creatorCreate.email')}
            type="email"
            value={form.email}
            onChange={onFieldChange('email')}
            autoComplete="email"
          />
          <TextField
            label={t('creatorCreate.region')}
            value={form.region}
            onChange={onFieldChange('region')}
            placeholder={t('creatorCreate.regionPlaceholder')}
            autoComplete="off"
          />
        </FormLayout.Group>
        <FormLayout.Group>
          <Select
            label={t('creatorDetail.owner')}
            options={managerOwnerOptions}
            value={form.manager_owner}
            onChange={onFieldChange('manager_owner')}
          />
          <TextField
            label={t('creatorCreate.tags')}
            value={form.tags}
            onChange={onFieldChange('tags')}
            placeholder={t('creatorCreate.tagsPlaceholder')}
            autoComplete="off"
          />
        </FormLayout.Group>
      </FormLayout>
    </DetailsSubsection>
  );

  return (
    <section className="crm-add-creator__card crm-add-creator__details-card" id="creator-details">
      <div className="crm-add-creator__card-header">
        <div className="crm-add-creator__card-heading-copy">
          <h2 className="crm-add-creator__card-title">{t('creatorCreate.addSupportingDetails')}</h2>
        </div>
        {hideMainToggle ? null : (
          <button
            type="button"
            className="crm-add-creator__details-expand-btn"
            onClick={onToggle}
            aria-expanded={open}
          >
            {open ? t('common.hide') : t('creatorCreate.addDetails')}
          </button>
        )}
      </div>

      <Collapsible open={open} id="creator-additional-details">
        <div className="crm-add-creator__details-sections">
          {flatMode ? (
            <>
              {communicationSection}
              {commercialSection}
              {profileSection}
            </>
          ) : (
            <>
              {commercialSection}
              {communicationSection}
              {profileSection}
            </>
          )}

          {hideMonthlyProgress ? null : (
            <DetailsSubsection
              title={t('creatorCreate.monthlyProgress')}
              badge={t('creatorCreate.optional')}
              open={flatMode ? true : monthlyProgressOpen}
              flat={flatMode}
              onToggle={onMonthlyProgressToggle}
            >
              <div className="crm-add-creator__monthly-progress-wrap">
                <BlockStack gap="300">
                  <Text as="p" tone="subdued" variant="bodySm">
                    {t('creatorCreate.progressEditorHelp')}
                  </Text>
                  <MonthlyProgressEditor
                    periods={form.monthly_progress}
                    onChange={onMonthlyProgressChange}
                    embedded
                    checkInOptions="yesNo"
                    urlVariant="icon"
                  />
                </BlockStack>
              </div>
            </DetailsSubsection>
          )}
        </div>
      </Collapsible>
    </section>
  );
}
