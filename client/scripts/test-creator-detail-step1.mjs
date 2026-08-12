import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [header, page, metrics, detailStyles, platformAccounts, sponsorship, supportingSurface, progressReadView] = await Promise.all([
  readFile(new URL('../src/components/CreatorProfileHeader.jsx', import.meta.url), 'utf8'),
  readFile(new URL('../src/pages/CreatorDetailPage.jsx', import.meta.url), 'utf8'),
  readFile(new URL('../src/components/CreatorDetailSummaryMetrics.jsx', import.meta.url), 'utf8'),
  readFile(new URL('../src/styles/creator-detail.css', import.meta.url), 'utf8'),
  readFile(new URL('../src/components/CreatorPlatformAccounts.jsx', import.meta.url), 'utf8'),
  readFile(new URL('../src/components/CreatorSponsorshipDetails.jsx', import.meta.url), 'utf8'),
  readFile(new URL('../src/components/CreatorDetailSupportingSurface.jsx', import.meta.url), 'utf8'),
  readFile(new URL('../src/components/MonthlyProgressReadView.jsx', import.meta.url), 'utf8'),
]);

assert.match(header, /CreatorTableAvatar/, 'The header must reuse the shared creator avatar.');
assert.match(header, /HeroContextRow/, 'The header must keep secondary identity context separate from the name.');
assert.match(header, /crm-detail-hero__chip/, 'Channel and category must use the established identity-chip treatment.');
assert.match(header, /crm-detail-header__name/, 'Creator name must remain the page heading.');
assert.match(header, /crm-detail-header__handle/, 'Creator handle must remain visible as secondary identity text.');
assert.match(page, /crm-detail-hero/, 'The page must retain the CRM profile hero.');
assert.match(page, /crm-detail-primary-content/, 'Primary detail content must remain a distinct region.');
assert.match(page, /CreatorDetailSupportingSurface/, 'Supporting details must use one grouped sidebar surface.');
assert.match(metrics, /creatorDetail\.totalFollowers/, 'Overview must include total followers.');
assert.match(metrics, /creatorDetail\.connectedPlatforms/, 'Overview must include connected platforms.');
assert.match(metrics, /creatorDetail\.region/, 'Overview must include region.');
assert.match(metrics, /creatorDetail\.nextFollowup/, 'Overview must include next follow-up.');
assert.match(metrics, /PLATFORM_META\.filter/, 'Connected platforms must reuse existing platform metadata.');
assert.match(metrics, /normalizeExternalUrl/, 'Connected platform detection must reuse URL normalization.');
assert.match(platformAccounts, /crm-detail-channel-surface/, 'Channels must be rendered as a dedicated resource surface.');
assert.match(platformAccounts, /CreatorPlatformProfileCard/, 'Channel rows must reuse the shared platform profile row.');
assert.match(sponsorship, /CreatorPartnershipSection/, 'Partnership view mode must use its summary component.');
assert.match(sponsorship, /crm-detail-partnership-surface/, 'Partnership must share the section surface system.');
assert.match(supportingSurface, /crm-detail-supporting-surface/, 'Supporting content must be grouped into one sidebar surface.');
assert.match(detailStyles, /\.crm-detail-hero-metrics-grid--hero-side/, 'Overview must use the unified hero metrics surface.');
assert.match(detailStyles, /\.crm-detail-channel-surface/, 'Channel section styles must be defined in the detail stylesheet.');
assert.match(detailStyles, /\.crm-detail-supporting-surface/, 'Supporting surface styles must be defined in the detail stylesheet.');
assert.match(progressReadView, /data-label=\{t\('progress\.period'\)\}/, 'Progress rows must expose labels for narrow layouts.');
assert.match(detailStyles, /@media \(max-width: 640px\)[\s\S]*?\.crm-detail-progress-table td::before/s, 'Progress rows must switch to a labeled mobile layout.');

console.log('Creator Detail current structure contract passed.');
