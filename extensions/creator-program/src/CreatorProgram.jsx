/** @jsxImportSource preact */
import '@shopify/ui-extensions/preact';
import { render } from 'preact';
import { useEffect, useState } from 'preact/hooks';

const APP_URL = 'https://osjgakhffqyk.sealosbja.site';

export default async () => {
  render(<CreatorProgram />, document.body);
};

function CreatorProgram() {
  const [state, setState] = useState({ loading: true, profile: null, error: null });

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const token = await shopify.sessionToken.get();
        const response = await fetch(`${APP_URL}/api/customer-account/creator-program`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Unable to load your program details');
        }

        if (active) setState({ loading: false, profile: result.data, error: null });
      } catch (error) {
        if (active) setState({ loading: false, profile: null, error: error.message });
      }
    }

    loadProfile();
    return () => { active = false; };
  }, []);

  if (state.loading) {
    return <s-section heading="Creator Program"><s-spinner accessibilityLabel="Loading creator program" /></s-section>;
  }

  if (state.error) {
    return <s-section heading="Creator Program"><s-banner heading="We could not load your program details" tone="critical">{state.error}</s-banner></s-section>;
  }

  if (!state.profile) {
    return null;
  }

  const profile = state.profile;
  const legalName = [profile.first_name, profile.last_name].filter(Boolean).join(' ');

  return (
    <s-section heading="Creator Program">
      <s-stack direction="block" gap="base">
        <s-text type="strong">{profile.business_name || legalName}</s-text>
        {legalName ? <s-text>Name: {legalName}</s-text> : null}
        {profile.channel ? <s-text>Handle: {profile.channel}</s-text> : null}
        {profile.niche_category ? <s-text>Category: {profile.niche_category}</s-text> : null}
        <s-text>Status: {profile.status || 'Active'}</s-text>
        {profile.bio ? <s-paragraph>{profile.bio}</s-paragraph> : null}
        {profile.affiliate_code ? <s-clipboard-item text={profile.affiliate_code} /> : <s-text>No affiliate code is available yet.</s-text>}
      </s-stack>
    </s-section>
  );
}
