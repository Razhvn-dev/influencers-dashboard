import { useMemo, useState } from "react";
import { Form, useNavigation } from "react-router";
import * as Polaris from "@shopify/polaris";

const STATUS_OPTIONS = [
  { label: "Applied", value: "APPLIED" },
  { label: "Contacted", value: "CONTACTED" },
  { label: "Call Scheduled", value: "CALL_SCHEDULED" },
  { label: "Under Review", value: "UNDER_REVIEW" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Active Ambassador", value: "ACTIVE_AMBASSADOR" },
  { label: "Past Partner", value: "PAST_PARTNER" },
];

function toDateTimeLocal(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

function toStringValue(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

export function InfluencerForm({ influencer, onDirtyChange }) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const initialForm = useMemo(
    () => ({
      name: toStringValue(influencer?.name),
      company: toStringValue(influencer?.company),
      email: toStringValue(influencer?.email),
      location: toStringValue(influencer?.location),
      collaborationStatus: toStringValue(influencer?.collaborationStatus, "APPLIED"),
      youtubeUrl: toStringValue(influencer?.youtubeUrl),
      facebookUrl: toStringValue(influencer?.facebookUrl),
      instagramUrl: toStringValue(influencer?.instagramUrl),
      tiktokUrl: toStringValue(influencer?.tiktokUrl),
      youtubeFollowers: toStringValue(influencer?.youtubeFollowers, "0"),
      facebookFollowers: toStringValue(influencer?.facebookFollowers, "0"),
      instagramFollowers: toStringValue(influencer?.instagramFollowers, "0"),
      tiktokFollowers: toStringValue(influencer?.tiktokFollowers, "0"),
      notes: toStringValue(influencer?.notes),
      contractStatus: toStringValue(influencer?.contractStatus),
      productsOffered: toStringValue(influencer?.productsOffered),
      deliverables: toStringValue(influencer?.deliverables),
      lastContactDate: toDateTimeLocal(influencer?.lastContactDate),
      nextFollowUpDate: toDateTimeLocal(influencer?.nextFollowUpDate),
      specialRequirements: toStringValue(influencer?.specialRequirements),
    }),
    [influencer],
  );

  const [form, setForm] = useState(initialForm);

  const setField = (field) => (value) => {
    if (field.includes("Followers")) {
      const numericValue = value.replace(/\D/g, "");
      setForm((prev) => {
        const newForm = { ...prev, [field]: numericValue };
        if (onDirtyChange) {
          onDirtyChange(true);
        }
        return newForm;
      });
    } else {
      setForm((prev) => {
        const newForm = { ...prev, [field]: value };
        if (onDirtyChange) {
          onDirtyChange(true);
        }
        return newForm;
      });
    }
  };

  return (
    <Form method="post">
      <Polaris.BlockStack gap="400">
        <Polaris.Card>
          <Polaris.BlockStack gap="300">
            <Polaris.Text as="h3" variant="headingMd">
              Basic Information
            </Polaris.Text>
            <Polaris.InlineGrid columns={{ xs: 1, md: 2 }} gap="300">
              <Polaris.TextField label="Name" name="name" value={form.name} onChange={setField("name")} autoComplete="name" requiredIndicator />
              <Polaris.TextField label="Company/Channel" name="company" value={form.company} onChange={setField("company")} autoComplete="organization" requiredIndicator />
              <Polaris.TextField label="Email" name="email" type="email" value={form.email} onChange={setField("email")} autoComplete="email" requiredIndicator />
              <Polaris.TextField label="Region" name="location" value={form.location} onChange={setField("location")} autoComplete="address-level1" requiredIndicator />
            </Polaris.InlineGrid>
            <Polaris.Select label="Collaboration Status" name="collaborationStatus" options={STATUS_OPTIONS} value={form.collaborationStatus} onChange={setField("collaborationStatus")} />
          </Polaris.BlockStack>
        </Polaris.Card>

        <Polaris.Card>
          <Polaris.BlockStack gap="300">
            <Polaris.Text as="h3" variant="headingMd">
              Social Media Links
            </Polaris.Text>
            <Polaris.InlineGrid columns={{ xs: 1, md: 2 }} gap="300">
              <Polaris.TextField label="YouTube" name="youtubeUrl" type="url" value={form.youtubeUrl} onChange={setField("youtubeUrl")} autoComplete="off" placeholder="https://youtube.com/..." />
              <Polaris.TextField label="Facebook" name="facebookUrl" type="url" value={form.facebookUrl} onChange={setField("facebookUrl")} autoComplete="off" placeholder="https://facebook.com/..." />
              <Polaris.TextField label="Instagram" name="instagramUrl" type="url" value={form.instagramUrl} onChange={setField("instagramUrl")} autoComplete="off" placeholder="https://instagram.com/..." />
              <Polaris.TextField label="TikTok" name="tiktokUrl" type="url" value={form.tiktokUrl} onChange={setField("tiktokUrl")} autoComplete="off" placeholder="https://tiktok.com/..." />
            </Polaris.InlineGrid>
          </Polaris.BlockStack>
        </Polaris.Card>

        <Polaris.Card>
          <Polaris.BlockStack gap="300">
            <Polaris.Text as="h3" variant="headingMd">
              Follower Data
            </Polaris.Text>
            <Polaris.InlineGrid columns={{ xs: 1, sm: 2, md: 4 }} gap="300">
              <Polaris.TextField label="YouTube Followers" name="youtubeFollowers" type="text" inputMode="numeric" pattern="[0-9]*" value={form.youtubeFollowers} onChange={setField("youtubeFollowers")} autoComplete="off" placeholder="0" />
              <Polaris.TextField label="Facebook Followers" name="facebookFollowers" type="text" inputMode="numeric" pattern="[0-9]*" value={form.facebookFollowers} onChange={setField("facebookFollowers")} autoComplete="off" placeholder="0" />
              <Polaris.TextField label="Instagram Followers" name="instagramFollowers" type="text" inputMode="numeric" pattern="[0-9]*" value={form.instagramFollowers} onChange={setField("instagramFollowers")} autoComplete="off" placeholder="0" />
              <Polaris.TextField label="TikTok Followers" name="tiktokFollowers" type="text" inputMode="numeric" pattern="[0-9]*" value={form.tiktokFollowers} onChange={setField("tiktokFollowers")} autoComplete="off" placeholder="0" />
            </Polaris.InlineGrid>
          </Polaris.BlockStack>
        </Polaris.Card>

        <Polaris.Card>
          <Polaris.BlockStack gap="300">
            <Polaris.Text as="h3" variant="headingMd">
              Business & Follow-up
            </Polaris.Text>
            <Polaris.InlineGrid columns={{ xs: 1, md: 2 }} gap="300">
              <Polaris.TextField label="Contract Status" name="contractStatus" value={form.contractStatus} onChange={setField("contractStatus")} autoComplete="off" placeholder="e.g., Signed, Pending" />
              <Polaris.TextField label="Promised Products" name="productsOffered" value={form.productsOffered} onChange={setField("productsOffered")} autoComplete="off" placeholder="e.g., Product A, Product B" />
              <Polaris.TextField label="Deliverables" name="deliverables" value={form.deliverables} onChange={setField("deliverables")} autoComplete="off" placeholder="e.g., 2 short videos + 1 post" />
              <Polaris.TextField label="Last Contact" name="lastContactDate" type="datetime-local" value={form.lastContactDate} onChange={setField("lastContactDate")} autoComplete="off" />
              <Polaris.TextField label="Next Follow-up" name="nextFollowUpDate" type="datetime-local" value={form.nextFollowUpDate} onChange={setField("nextFollowUpDate")} autoComplete="off" />
            </Polaris.InlineGrid>
            <Polaris.TextField label="Communication Notes" name="notes" value={form.notes} onChange={setField("notes")} multiline={4} autoComplete="off" />
            <Polaris.TextField label="Special Requirements" name="specialRequirements" value={form.specialRequirements} onChange={setField("specialRequirements")} multiline={3} autoComplete="off" />
          </Polaris.BlockStack>
        </Polaris.Card>

        <Polaris.InlineStack align="end">
          <Polaris.Button
            submit
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Polaris.Button>
        </Polaris.InlineStack>
      </Polaris.BlockStack>
    </Form>
  );
}
