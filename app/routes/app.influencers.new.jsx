import { useEffect, useState } from "react";
import { useActionData, useNavigate } from "react-router";
import * as Polaris from "@shopify/polaris";

import { InfluencerForm } from "../components/InfluencerForm";
import { createInfluencer } from "../models/influencer.server";
import styles from "../../app/app.influencers._index.styles.module.css";

const DEV_MODE = process.env.DEV_MODE === "true";
const DEV_SHOP = "dev-shop.myshopify.com";

export const loader = async ({ request }) => {
  const shop = DEV_MODE ? DEV_SHOP : new URL(request.url).searchParams.get("shop");
  return { shop };
};

export const action = async ({ request }) => {
  const shop = DEV_MODE ? DEV_SHOP : new URL(request.url).searchParams.get("shop");

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
      shopId: shop,
    };

    try {
      const influencer = await createInfluencer(data);
      return {
        success: true,
        message: "Creator created successfully.",
        influencerId: influencer.id,
      };
    } catch (error) {
      console.error("Error creating influencer:", error);
      return { error: error.message || "Failed to create creator, please try again." };
    }
  }

  return {};
};

export default function NewInfluencerPage() {
  const actionData = useActionData();
  const navigate = useNavigate();
  const [showBanner, setShowBanner] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (!actionData) return;
    setShowBanner(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    // 提交成功后重置未保存标志
    if (actionData.success) {
      setHasUnsavedChanges(false);
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

  return (
    <div className={styles.pageContainer}>
      <Polaris.Page
        title="Add Creator"
        subtitle="Fill in basic info, social media data, and business follow-up info"
        backAction={{ content: "Back", onAction: handleBack }}
      >
        <Polaris.Layout>
        {actionData?.success && showBanner && (
          <Polaris.Layout.Section>
            <Polaris.Banner tone="success" onDismiss={() => setShowBanner(false)}>
              <p>{actionData.message}</p>
            </Polaris.Banner>
          </Polaris.Layout.Section>
        )}

        {actionData?.error && (
          <Polaris.Layout.Section>
            <Polaris.Banner tone="critical">
              <p>{actionData.error}</p>
            </Polaris.Banner>
          </Polaris.Layout.Section>
        )}

        <Polaris.Layout.Section>
          <InfluencerForm onDirtyChange={setHasUnsavedChanges} />
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
