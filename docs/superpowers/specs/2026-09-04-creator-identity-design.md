# Creator identity fields design

## Goal

Make a creator's Business / Channel Name the primary identity shown across the Creator List and Creator Detail, while separately recording their First Name and Last Name. Preserve all existing creator records and the established social-handle field.

## Scope

- Add nullable `business_name`, `first_name`, and `last_name` columns to `influencers`.
- Keep `name` as the legacy-compatible full-name/display fallback; do not rename or drop it.
- Keep `channel` as the existing social username / handle field. Do not reuse `company_name`, which is historical data already copied into `channel` by migration `003_sponsorship_tracking_schema.sql`.
- For new creators, require a Business / Channel Name and a First Name. Last Name remains optional so mononymous creators can be recorded accurately.
- When first and/or last names are provided, the server derives and stores `name` from those values for compatibility with existing APIs, history, and sponsorship CSV files.
- Existing rows remain valid: leave the new fields NULL and show `name` as the primary fallback until a merchant completes the new fields. Never attempt to split historic names automatically.
- Update API select/returning/insert/update/search/sort paths, form state and validation, add/edit/detail/list identity rendering, i18n, and detailed CSV / XLSX exports.
- Preserve the legacy sponsorship progress CSV's `Name,Channel,...` layout: it continues to use compatibility `name` and social `channel` so existing spreadsheets can still be imported/exported.

## Display rules

For new or completed records, display Business / Channel Name first, the joined First Name and Last Name second, and existing channel/platform handle as social context. For legacy records without Business / Channel Name, display the existing `name` first and existing `channel` as social context. Apply this to list rows, mobile cards, preview, and detail header. Avatar initials continue to use the displayed primary identity.

## Non-goals

- No Customer Account extension, customer linking field, OAuth/auth changes, Shopify scope changes, or storefront/customer-facing data endpoint.
- No automatic customer matching by name or email.
- No change to routes, CRUD ownership checks, sponsorship tracking logic, platform URLs, imports, or existing responsive information architecture.

## Customer Accounts follow-up (separate work)

The later request is a customer-facing program view. The recommended first release is a Customer Account profile block that only renders program data for an explicitly linked customer; ordinary customers see nothing. A literal customer-account navigation tab cannot be selectively added per individual customer because account navigation is configured globally by the merchant. That work needs an explicit `shopify_customer_id` link and a dedicated, verified Customer Account extension auth path before any data is exposed.
