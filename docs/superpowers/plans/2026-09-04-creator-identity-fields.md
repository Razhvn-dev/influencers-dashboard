# Creator Identity Fields Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Record Business / Channel Name, First Name, and Last Name for creators, make Business / Channel Name the primary product identity, and preserve legacy data and sponsorship CSV interoperability.

**Architecture:** PostgreSQL receives three nullable identity fields and retains `name` as a compatibility field. Express validates and derives the compatibility name; React renders a shared identity order with a legacy fallback. Detailed exports gain the fields while sponsorship CSV keeps `Name,Channel,...` unchanged.

**Tech Stack:** PostgreSQL 16, Express, node-postgres, React, Shopify Polaris, node:test, Vite.

## Global Constraints

- Do not rename, remove, or repurpose `influencers.name`, `influencers.channel`, or `influencers.company_name`.
- `business_name` and `first_name` are required only for new records; legacy records without new identity values remain valid.
- Derive compatibility `name` server-side from supplied legal-name fields and never auto-split historic `name` values.
- Preserve sponsorship CSV positional columns: `Name` maps to `name`; `Channel` maps to `channel`.
- Do not add Customer Account work, customer matching, scope changes, OAuth changes, or storefront endpoints.

---

### Task 1: Add backward-compatible database columns

**Files:**
- Create: `migrations/006_add_creator_identity_fields.sql`
- Modify: `init.sql`
- Test: `test/creatorIdentityMigration.test.js`

**Interfaces:** Produces nullable `business_name TEXT`, `first_name TEXT`, and `last_name TEXT` columns.

- [ ] **Step 1: Write the failing migration test**

Create `test/creatorIdentityMigration.test.js` with assertions that the migration contains `ADD COLUMN IF NOT EXISTS business_name TEXT`, `first_name TEXT`, and `last_name TEXT`, and contains no `UPDATE influencers SET first_name` statement.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test test/creatorIdentityMigration.test.js`

Expected: FAIL because the migration does not exist.

- [ ] **Step 3: Implement the additive migration**

Create SQL containing these exact statements:

    ALTER TABLE influencers ADD COLUMN IF NOT EXISTS business_name TEXT;
    ALTER TABLE influencers ADD COLUMN IF NOT EXISTS first_name TEXT;
    ALTER TABLE influencers ADD COLUMN IF NOT EXISTS last_name TEXT;

Add matching nullable fields and comments in `init.sql` beside the existing identity columns. Do not backfill or alter existing rows.

- [ ] **Step 4: Verify and commit**

Run: `node --test test/creatorIdentityMigration.test.js`

Then: `git add init.sql migrations/006_add_creator_identity_fields.sql test/creatorIdentityMigration.test.js && git commit -m "feat: add creator identity database fields"`

### Task 2: Centralize server identity validation and persistence

**Files:**
- Create: `lib/creatorIdentity.js`
- Modify: `routes/influencers.js`
- Test: `test/creatorIdentity.test.js`

**Interfaces:** `normalizeCreatorIdentity(input, existing)` returns `{ business_name, first_name, last_name, name }`; `getCreatorPrimaryIdentity(record)` returns `business_name || name || ''`.

- [ ] **Step 1: Write failing unit tests**

Test that new records fail without a business name or first name; that `{ business_name: 'Jay Builds', first_name: 'Jay', last_name: '' }` normalizes to `{ business_name: 'Jay Builds', first_name: 'Jay', last_name: null, name: 'Jay' }`; and that an existing `{ id: 1, name: 'Legacy Creator' }` remains valid with all new fields null.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test test/creatorIdentity.test.js`

Expected: FAIL because `lib/creatorIdentity.js` does not exist.

- [ ] **Step 3: Implement minimal identity normalizer and route wiring**

The normalizer cleans values, detects a new record from absent `existing.id`, requires `business_name` and `first_name` only for new records, joins first/last with one space, and falls back to the existing compatibility `name` when legal-name inputs are absent. Add the three fields to `INFLUENCER_ROW_SELECT`, `INFLUENCER_RETURNING_COLUMNS`, `influencerRowValues`, INSERT column lists, UPDATE assignments, search conditions, and `SORT_COLUMNS`. Call the normalizer from `buildRecordPayload`.

- [ ] **Step 4: Verify and commit**

Run: `node --test test/creatorIdentity.test.js && npm test`

Then: `git add routes/influencers.js lib/creatorIdentity.js test/creatorIdentity.test.js && git commit -m "feat: support creator business and legal names"`

### Task 3: Add identity form fields and translations

**Files:**
- Modify: `client/src/constants.js`
- Modify: `client/src/components/add-creator/BasicInformationCard.jsx`
- Modify: `client/src/pages/AddCreatorPage.jsx`
- Modify: `client/src/components/CreatorProfilePanel.jsx`
- Modify: `client/src/i18n/locales/en.js`
- Modify: `client/src/i18n/locales/zh.js`
- Test: the project’s existing client test location

**Interfaces:** `creatorPrimaryName(record)` returns `record.business_name || record.name || ''`; `creatorLegalName(record)` joins non-empty first/last values. `buildFormStateFromRecord` and `buildSavePayload` carry all three fields.

- [ ] **Step 1: Write failing client helper tests**

Assert that a record with `business_name: 'Grimes Outdoors', name: 'Russell Grimes'` returns `Grimes Outdoors`, legacy `name: 'Legacy Creator'` returns `Legacy Creator`, and `{ first_name: 'Russell', last_name: 'Grimes' }` returns `Russell Grimes`.

- [ ] **Step 2: Run the focused test to verify it fails**

Run the repository’s configured client test command for that test file.

Expected: FAIL because identity helpers do not exist.

- [ ] **Step 3: Implement form state, validation, and copy**

Add Business / Channel Name as the first full-width required form field, First Name and Last Name next, then retain Username / Handle for `channel`. Use i18n keys in English and Chinese. Add client validation mirroring the server requirements for new records. Detail edit mode uses the same data fields and payload mapping.

- [ ] **Step 4: Verify and commit**

Run: `npm run build`

Then: `git add client/src/constants.js client/src/components/add-creator/BasicInformationCard.jsx client/src/pages/AddCreatorPage.jsx client/src/components/CreatorProfilePanel.jsx client/src/i18n/locales/en.js client/src/i18n/locales/zh.js && git commit -m "feat: add creator identity form fields"`

### Task 4: Use the shared identity order in all creator surfaces

**Files:**
- Modify: `client/src/components/creator-list/CreatorIdentityCell.jsx`
- Modify: `client/src/components/creator-list/CreatorMobileCard.jsx`
- Modify: `client/src/components/add-creator/CreatorPreviewCard.jsx`
- Modify: `client/src/components/CreatorProfileHeader.jsx`
- Modify: `client/src/components/CreatorProfileSummary.jsx`

**Interfaces:** New records display business name, then legal name, then social context. Legacy records display `name`, then social context.

- [ ] **Step 1: Write the display contract test**

Assert that business name wins when present and legacy `name` remains the fallback.

- [ ] **Step 2: Run it to verify the current direct `record.name` rendering fails the contract**

Run the project’s focused client test command.

Expected: FAIL until all listed components consume the shared helpers.

- [ ] **Step 3: Replace direct primary-name rendering**

Use `creatorPrimaryName` for list row/mobile card/preview/detail heading titles. Show legal name only if non-empty and different from the title. Keep existing `creatorHandle` and platform context. Use primary identity for avatar initials and color input.

- [ ] **Step 4: Verify visual behavior and commit**

Inspect Add Creator, Creator List, and Creator Detail at 1440px and 390px in English and Chinese. Then commit the five component files with message `feat: display creator business identity first`.

### Task 5: Extend detailed export without breaking sponsorship CSV

**Files:**
- Modify: `lib/influencersExport.js`
- Modify: `lib/influencersCsv.js` only if headers are duplicated there
- Modify: `lib/influencersXlsx.js` only if headers are duplicated there
- Test: `test/influencersExport.test.js`

**Interfaces:** Detailed CSV/XLSX starts with `Business / Channel Name`, `First Name`, `Last Name`, then compatibility `Name`; sponsorship CSV remains `Name,Channel,...`.

- [ ] **Step 1: Write failing export regression tests**

Assert that the detailed header’s first four labels match the interface, and that parsing `Name,Channel\nLegacy Creator,@legacy\n` returns `{ name: 'Legacy Creator', channel: '@legacy' }`.

- [ ] **Step 2: Run the export test to verify it fails**

Run: `node --test test/influencersExport.test.js`

Expected: FAIL because detailed identity headers are absent.

- [ ] **Step 3: Add detailed export columns only**

Add the three new columns before the existing `Name` column in `buildExportColumns`. Do not change `SPONSORSHIP_EXPORT_HEADER`, `rowToSponsorshipRecord`, or `sponsorshipRecordToCsvCells` positions.

- [ ] **Step 4: Verify and commit**

Run: `node --test test/influencersExport.test.js && npm test`

Then commit the export implementation and test with message `feat: export creator business identity fields`.

### Task 6: Verify migration, legacy data, and real UI behavior

**Files:**
- Modify: deployment documentation only if it explicitly lists migrations

- [ ] **Step 1: Run all automated checks**

Run: `npm test && npm run build && git diff --check`

Expected: all commands exit 0.

- [ ] **Step 2: Apply the migration to only a disposable/local database**

Run: `npm run migrate`

Then query `information_schema.columns` for `business_name`, `first_name`, and `last_name`; expect exactly those three columns.

- [ ] **Step 3: Perform browser QA**

Create a disposable creator using Business / Channel Name `Grimes Outdoors`, First Name `Russell`, Last Name `Grimes`, and a handle. Save, reload, inspect list/detail/preview order, edit and save. Confirm a legacy row still reads/saves with its original `name`. Export CSV/XLSX and inspect headers. Delete the disposable record.

- [ ] **Step 4: Perform language and responsive QA**

At 1440px and 390px, inspect Creator List, Add Creator, and Creator Detail in English and Chinese. Confirm no raw i18n keys, no horizontal scrolling, and no field or badge overlap.

## Self-review

- Schema and legacy safety: Task 1.
- Server reads, writes, filtering, sorting, imports: Task 2.
- Input controls, i18n, form payloads: Task 3.
- Every primary identity surface: Task 4.
- Detailed export and legacy sponsorship CSV protection: Task 5.
- Migration, UI, legacy record, i18n, build, test, and diff validation: Task 6.
- Property names use one consistent snake_case contract: `business_name`, `first_name`, and `last_name`.
