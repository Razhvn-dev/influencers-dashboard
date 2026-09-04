import { useCallback, useState } from 'react';
import {
  ActionList,
  BlockStack,
  Box,
  Button,
  InlineStack,
  Popover,
} from '@shopify/polaris';
import { MenuHorizontalIcon } from '@shopify/polaris-icons';
import { creatorHandle, creatorLegalName, creatorPrimaryName, formatFollowupDate } from '../constants';
import CreatorTableAvatar from './dashboard/CreatorTableAvatar';
import LevelBadge from './dashboard/LevelBadge';
import StatusBadge from './dashboard/StatusBadge';
import PageBackButton from './PageBackButton';
import { useTranslation } from '../i18n/LanguageContext.jsx';

function displayHandle(record) {
  const handle = creatorHandle(record);
  if (handle && handle !== '-') {
    const explicitHandle = String(handle).match(/@[a-z0-9_.-]+/i);
    return explicitHandle ? explicitHandle[0] : handle;
  }

  const nameHandle = String(record?.name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');

  return nameHandle ? `@${nameHandle}` : '-';
}

function HeroContextRow({ form }) {
  const { t } = useTranslation();

  const channel = String(form.channel || '').trim();
  const category = String(form.niche_category || '').trim() || t('creatorDetail.noCategory');
  const email = String(form.email || '').trim();
  const owner = String(form.manager_owner || '').trim();
  const lastContact = form.last_contacted_at
    ? formatFollowupDate(form.last_contacted_at)
    : '';

  const facts = [
    lastContact ? t('creatorDetail.lastContact', { date: lastContact }) : null,
    owner ? `${t('creatorDetail.owner')}: ${owner}` : null,
    email || null,
  ].filter(Boolean);

  return (
    <div className="crm-detail-hero__context">
      <div className="crm-detail-hero__chips">
        {channel ? <span className="crm-detail-hero__chip">{channel}</span> : null}
        <span className="crm-detail-hero__chip crm-detail-hero__chip--muted">{category}</span>
      </div>
      {facts.length ? (
        <div className="crm-detail-hero__facts" aria-label={t('creatorDetail.heroContextLabel')}>
          {facts.map((fact) => (
            <span key={fact} className="crm-detail-hero__fact">
              {fact}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function CreatorProfileHeader({
  form,
  ambassadorLevel,
  onBack,
  onStartEdit,
  onDelete,
  isEditing = false,
  saving = false,
  deleting = false,
  toolbarEnd = null,
  embeddedInHero = false,
  hideBack = false,
  hideActions = false,
  metricsSlot = null,
}) {
  const { t } = useTranslation();
  const handle = displayHandle(form);
  const legalName = creatorLegalName(form);
  const primaryName = creatorPrimaryName(form);
  const [moreActionsOpen, setMoreActionsOpen] = useState(false);
  const inlineHeroLayout = embeddedInHero && hideBack;

  const toggleMoreActions = useCallback(() => {
    setMoreActionsOpen((open) => !open);
  }, []);

  const closeMoreActions = useCallback(() => {
    setMoreActionsOpen(false);
  }, []);

  const handleDelete = useCallback(() => {
    closeMoreActions();
    onDelete();
  }, [closeMoreActions, onDelete]);

  const actionButtons =
    !isEditing && !hideActions ? (
    <div className="crm-detail-header__actions">
      <InlineStack gap="200" wrap={false} blockAlign="center">
        <Popover
          active={moreActionsOpen}
          onClose={closeMoreActions}
          activator={
            <Button
              variant="plain"
              icon={MenuHorizontalIcon}
              accessibilityLabel={t('common.moreActions')}
              onClick={toggleMoreActions}
              disabled={saving || deleting}
            />
          }
        >
          <ActionList
            items={[
              {
                content: t('common.delete'),
                destructive: true,
                onAction: handleDelete,
              },
            ]}
          />
        </Popover>
        <Button variant="primary" onClick={onStartEdit} disabled={saving || deleting}>
          {t('detail.editCreator')}
        </Button>
      </InlineStack>
    </div>
  ) : null;

  const identityBlock = (
    <InlineStack gap="500" blockAlign="start" wrap={false}>
      <Box className="crm-detail-header__avatar">
        <CreatorTableAvatar record={form} className="crm-detail-header__creator-avatar" />
      </Box>

      <BlockStack gap="0" className="crm-detail-header__identity-text">
        <h1 className="crm-detail-header__name">{primaryName || t('creatorDetail.profileFallback')}</h1>
        {legalName && legalName !== primaryName ? (
          <p className="crm-detail-header__handle">{legalName}</p>
        ) : null}
        <p className="crm-detail-header__handle">{handle}</p>

        <div className="crm-detail-header__identity-meta">
          <InlineStack gap="300" wrap>
            {form.status ? (
              <span className="crm-detail-header__status-group">
                <StatusBadge status={form.status} />
              </span>
            ) : null}
            {ambassadorLevel ? <LevelBadge level={ambassadorLevel} /> : null}
          </InlineStack>
        </div>
      </BlockStack>
    </InlineStack>
  );

  return (
    <Box
      className={`crm-detail-header${embeddedInHero ? ' crm-detail-header--hero' : ''}${
        inlineHeroLayout ? ' crm-detail-header--inline-hero' : ''
      }`}
    >
      {!inlineHeroLayout ? (
        <div className="crm-detail-header__toolbar">
          {hideBack ? null : (
            <PageBackButton label={t('detail.backToCreators')} onClick={onBack} />
          )}
          <div
            className={`crm-detail-header__toolbar-end${
              hideBack ? ' crm-detail-header__toolbar-end--full' : ''
            }`}
          >
            {toolbarEnd}
            {actionButtons}
          </div>
        </div>
      ) : null}

      {inlineHeroLayout ? (
        <div className="crm-detail-hero__body">
          <div className="crm-detail-hero__main">
            <Box className="crm-detail-header__identity-row">{identityBlock}</Box>
            <HeroContextRow form={form} />
          </div>
          {metricsSlot ? (
            <aside className="crm-detail-hero__aside" aria-label={t('creatorDetail.heroMetricsLabel')}>
              {metricsSlot}
            </aside>
          ) : null}
        </div>
      ) : (
        <>
          <div className="crm-detail-hero__head">
            <Box className="crm-detail-header__identity-row">{identityBlock}</Box>
            {metricsSlot ? (
              <div className="crm-detail-hero__metrics-top">{metricsSlot}</div>
            ) : null}
            {actionButtons}
          </div>
        </>
      )}
    </Box>
  );
}
