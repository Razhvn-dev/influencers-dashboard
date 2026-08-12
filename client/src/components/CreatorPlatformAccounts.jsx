import { useMemo, useState } from 'react';
import { BlockStack, Box, Text, TextField } from '@shopify/polaris';
import {
  derivePrimaryChannel,
  getPrimaryChannelPlatformKey,
  normalizeExternalUrl,
  parseFollowerCount,
  PLATFORM_META,
  sanitizeFollowerInput,
} from '../constants';
import { CreatorSectionCardShell } from './CreatorSectionCard';
import CreatorPlatformProfileCard from './CreatorPlatformProfileCard';
import PlatformIcon from './PlatformIcon';
import UrlFieldWithOpen from './UrlFieldWithOpen';
import { useTranslation } from '../i18n/LanguageContext.jsx';

function isPlatformConnected(platform, form) {
  return (
    Boolean(normalizeExternalUrl(form[platform.key])) ||
    parseFollowerCount(form[platform.followerField]) > 0
  );
}

function followerFieldProps(field, form, onChange) {
  return {
    type: 'number',
    min: 0,
    value: form[field],
    autoComplete: 'off',
    onChange: (value) => onChange({ ...form, [field]: sanitizeFollowerInput(value) }),
  };
}

function PlatformEditRow({ platform, form, onChange, t }) {
  const updateField = (field) => (value) => {
    onChange({ ...form, [field]: value });
  };

  return (
    <div className="crm-detail-platform-edit-row">
      <div className="crm-detail-platform-row__identity">
        <PlatformIcon platformKey={platform.key} size="large" withTooltip={false} />
        <span className="crm-detail-platform-row__name">{platform.label}</span>
      </div>

      <UrlFieldWithOpen
        label={`${platform.label} ${t('creatorDetail.profileUrl')}`}
        labelHidden
        value={form[platform.key]}
        onChange={updateField(platform.key)}
        placeholder={`${platform.label.toLowerCase()}.com/...`}
      />

      <TextField
        label={`${platform.label} ${t('creatorDetail.followers')}`}
        labelHidden
        type="number"
        min={0}
        placeholder="0"
        {...followerFieldProps(platform.followerField, form, onChange)}
      />
    </div>
  );
}

export default function CreatorPlatformAccounts({
  form,
  onChange,
  editing = false,
}) {
  const { t } = useTranslation();
  const primaryPlatformKey = getPrimaryChannelPlatformKey(derivePrimaryChannel(form));
  const [showDisconnected, setShowDisconnected] = useState(false);

  const { connectedPlatforms, disconnectedPlatforms } = useMemo(() => {
    const connected = [];
    const disconnected = [];
    PLATFORM_META.forEach((platform) => {
      if (isPlatformConnected(platform, form)) {
        connected.push(platform);
      } else {
        disconnected.push(platform);
      }
    });
    return { connectedPlatforms: connected, disconnectedPlatforms: disconnected };
  }, [form]);

  const readContent = (
    <section className="crm-detail-channel-surface" aria-label={t('creatorDetail.socialPlatforms')} role="table">
      <div className="crm-detail-view-section__header">
        <h2>{t('creatorDetail.socialPlatforms')}</h2>
      </div>
      <div
        className="crm-detail-platform-columns crm-detail-platform-columns--read"
        role="row"
      >
        <span role="columnheader">{t('creatorDetail.platform')}</span>
        <span role="columnheader">{t('creatorDetail.profile')}</span>
        <span role="columnheader">{t('creatorDetail.followers')}</span>
        <span role="columnheader">{t('creatorDetail.actions')}</span>
      </div>
      <div className="crm-detail-platform-list" role="rowgroup">
        {connectedPlatforms.map((platform) => (
          <CreatorPlatformProfileCard
            key={platform.key}
            platform={platform}
            form={form}
            primaryPlatformKey={primaryPlatformKey}
          />
        ))}
      </div>
      {disconnectedPlatforms.length ? (
        <div className="crm-detail-platform-disconnected">
          <button
            type="button"
            className="crm-detail-platform-disconnected__toggle"
            onClick={() => setShowDisconnected((open) => !open)}
            aria-expanded={showDisconnected}
          >
            {showDisconnected
              ? t('creatorDetail.hideDisconnectedPlatforms', { count: disconnectedPlatforms.length })
              : t('creatorDetail.showDisconnectedPlatforms', { count: disconnectedPlatforms.length })}
          </button>
          {showDisconnected ? (
            <div className="crm-detail-platform-list crm-detail-platform-list--disconnected">
              {disconnectedPlatforms.map((platform) => (
                <CreatorPlatformProfileCard
                  key={platform.key}
                  platform={platform}
                  form={form}
                  primaryPlatformKey={primaryPlatformKey}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );

  const editContent = (
    <BlockStack gap="0">
      <div className="crm-detail-platform-columns crm-detail-platform-columns--edit" aria-hidden="true">
        <span>{t('creatorDetail.platform')}</span>
        <span>{t('creatorDetail.profileUrl')}</span>
        <span>{t('creatorDetail.followers')}</span>
      </div>
      {PLATFORM_META.map((platform) => (
        <PlatformEditRow key={platform.key} platform={platform} form={form} onChange={onChange} t={t} />
      ))}
      <Box padding="400" background="bg-surface-secondary">
        <Text as="p" tone="subdued" variant="bodySm">
          {t('creatorDetail.platformEditHelp')}
        </Text>
      </Box>
    </BlockStack>
  );

  if (!editing) return readContent;
  return (
    <CreatorSectionCardShell
      title={t('creatorDetail.socialPlatforms')}
      editing={editing}
      readContent={readContent}
      editContent={editContent}
    />
  );
}
