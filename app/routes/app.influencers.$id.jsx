import { useEffect, useMemo, useState } from "react";
import { useActionData, useLoaderData, useNavigate } from "react-router";
import * as Polaris from "@shopify/polaris";

import { InfluencerForm } from "../components/InfluencerForm";
import { getInfluencer, updateInfluencer } from "../models/influencer.server";
import { formatFollowers } from "../utils/calculations";
import styles from "../../app/app.influencers._index.styles.module.css";

const DEV_MODE = process.env.DEV_MODE === "true";
const DEV_SHOP = "dev-shop.myshopify.com";

const LEVEL_LABELS = {
  AMBASSADOR_1: "Ambassador Level 1",
  AMBASSADOR_2: "Ambassador Level 2",
  AMBASSADOR_3: "Ambassador Level 3",
  NONE: "Not Qualified",
};

const STATUS_LABELS = {
  APPLIED: "Applied",
  CONTACTED: "Contacted",
  CALL_SCHEDULED: "Call Scheduled",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  ACTIVE_AMBASSADOR: "Active Ambassador",
  PAST_PARTNER: "Past Partner",
};

export const loader = async ({ params, request }) => {
  const shop =
    DEV_MODE ? DEV_SHOP : new URL(request.url).searchParams.get("shop") || "razhvn-test-shop.myshopify.com";
  const influencer = await getInfluencer(params.id, shop);

  if (!influencer) {
    throw new Response("Creator not found", { status: 404 });
  }

  return { influencer };
};

export const action = async ({ params, request }) => {
  const shop =
    DEV_MODE ? DEV_SHOP : new URL(request.url).searchParams.get("shop") || "razhvn-test-shop.myshopify.com";

  if (request.method === "POST") {
    const formData = await request.formData();
    const data = {
      name: formData.get("name"),
      company: formData.get("company"),
      email: formData.get("email"),
      location: formData.get("location"),
      youtubeUrl: formData.get("youtubeUrl"),
      facebookUrl: formData.get("facebookUrl"),
      instagramUrl: formData.get("instagramUrl"),
      tiktokUrl: formData.get("tiktokUrl"),
      youtubeFollowers: parseInt(formData.get("youtubeFollowers")) || 0,
      facebookFollowers: parseInt(formData.get("facebookFollowers")) || 0,
      instagramFollowers: parseInt(formData.get("instagramFollowers")) || 0,
      tiktokFollowers: parseInt(formData.get("tiktokFollowers")) || 0,
      collaborationStatus: formData.get("collaborationStatus"),
      notes: formData.get("notes"),
      contractStatus: formData.get("contractStatus"),
      productsOffered: formData.get("productsOffered"),
      deliverables: formData.get("deliverables"),
      lastContactDate: formData.get("lastContactDate") || null,
      nextFollowUpDate: formData.get("nextFollowUpDate") || null,
      specialRequirements: formData.get("specialRequirements"),
    };

    try {
      await updateInfluencer(params.id, shop, data);
      return { success: true, message: "Creator information updated." };
    } catch (error) {
      console.error("Error updating influencer:", error);
      return { error: "Failed to update creator, please try again." };
    }
  }

  return {};
};

export default function InfluencerDetailsPage() {
  const { influencer } = useLoaderData();
  const actionData = useActionData();
  const navigate = useNavigate();
  const [showBanner, setShowBanner] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (actionData?.success || actionData?.error) {
      setShowBanner(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      // 提交成功后重置未保存标志
      if (actionData.success) {
        setHasUnsavedChanges(false);
      }
    }
  }, [actionData]);

  const handleBack = () => {
    if (hasUnsavedChanges) {
      setShowConfirmDialog(true);
    } else {
      navigate(-1);
    }
  };

  // 放弃更改
  const handleDiscardChanges = () => {
    setShowConfirmDialog(false);
    setHasUnsavedChanges(false);
    navigate(-1);
  };

  const levelText = useMemo(
    () => LEVEL_LABELS[influencer.ambassadorLevel] || influencer.ambassadorLevel,
    [influencer.ambassadorLevel],
  );
  const statusText = useMemo(
    () => STATUS_LABELS[influencer.collaborationStatus] || influencer.collaborationStatus,
    [influencer.collaborationStatus],
  );

  return (
    <div className={styles.pageContainer}>
      <Polaris.Page
        title={influencer.name}
        subtitle={`${influencer.company || "No company"} | ${influencer.location || "No region"}`}
        backAction={{ content: "Back", onAction: handleBack }}
      >
      <Polaris.Layout>
        {showBanner && actionData?.success && (
          <Polaris.Layout.Section>
            <Polaris.Banner tone="success" onDismiss={() => setShowBanner(false)}>
              <p>{actionData.message || "Saved successfully."}</p>
            </Polaris.Banner>
          </Polaris.Layout.Section>
        )}
        {showBanner && actionData?.error && (
          <Polaris.Layout.Section>
            <Polaris.Banner tone="critical" onDismiss={() => setShowBanner(false)}>
              <p>{actionData.error}</p>
            </Polaris.Banner>
          </Polaris.Layout.Section>
        )}

        <Polaris.Layout.Section>
          <Polaris.Card>
            <Polaris.InlineGrid columns={{ xs: 1, sm: 3 }} gap="400">
              <Polaris.BlockStack gap="100">
                <Polaris.Text as="p" tone="subdued" variant="bodySm">
                  Total Followers
                </Polaris.Text>
                <Polaris.Text as="p" variant="headingLg">
                  {formatFollowers(influencer.totalFollowers || 0)}
                </Polaris.Text>
              </Polaris.BlockStack>
              <Polaris.BlockStack gap="100">
                <Polaris.Text as="p" tone="subdued" variant="bodySm">
                  Ambassador Level
                </Polaris.Text>
                <Polaris.Badge tone="info">{levelText}</Polaris.Badge>
              </Polaris.BlockStack>
              <Polaris.BlockStack gap="100">
                <Polaris.Text as="p" tone="subdued" variant="bodySm">
                  Collaboration Status
                </Polaris.Text>
                <Polaris.Badge tone="success">{statusText}</Polaris.Badge>
              </Polaris.BlockStack>
            </Polaris.InlineGrid>
          </Polaris.Card>
        </Polaris.Layout.Section>

        <Polaris.Layout.Section>
          <Polaris.BlockStack gap="300">
            <Polaris.Text as="h2" variant="headingMd">
              Edit Influencer Info
            </Polaris.Text>
            <InfluencerForm influencer={influencer} onDirtyChange={setHasUnsavedChanges} />
          </Polaris.BlockStack>
        </Polaris.Layout.Section>
      </Polaris.Layout>

      {/* 未保存更改确认对话框 */}
      <Polaris.Modal
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        title="Unsaved changes"
        primaryAction={{
          content: "Discard changes",
          destructive: true,
          onAction: handleDiscardChanges,
        }}
        secondaryActions={[
          {
            content: "Keep editing",
            onAction: () => setShowConfirmDialog(false),
          },
        ]}
      >
        <div style={{ padding: "40px 32px", textAlign: "center" }}>
          <Polaris.Text as="p">
            You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
          </Polaris.Text>
        </div>
      </Polaris.Modal>
    </Polaris.Page>
    </div>
  );
}
