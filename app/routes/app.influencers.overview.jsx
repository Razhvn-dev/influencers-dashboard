import { useEffect, useState } from "react";
import { useActionData, useLoaderData, useNavigate, useSearchParams, useSubmit } from "react-router";
import * as Polaris from "@shopify/polaris";

import { DeleteConfirmDialog } from "../components/DeleteConfirmDialog";
import { deleteInfluencer, deleteInfluencers, getInfluencers } from "../models/influencer.server";
import { authenticate } from "../shopify.server";
import styles from "../../app/app.influencers._index.styles.module.css";

const DEV_MODE = process.env.DEV_MODE === "true";
const DEV_SHOP = "dev-shop.myshopify.com";

function readText(formData, key) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export const loader = async ({ request }) => {
  const shopDomain = DEV_MODE ? DEV_SHOP : (await authenticate.admin(request)).session.shop;
  const influencers = await getInfluencers(shopDomain);

  return {
    influencers,
    devMode: DEV_MODE,
  };
};

export const action = async ({ request }) => {
  const shopDomain = DEV_MODE ? DEV_SHOP : (await authenticate.admin(request)).session.shop;
  const formData = await request.formData();
  const intent = readText(formData, "intent");

  try {
    if (intent === "delete") {
      await deleteInfluencer(readText(formData, "id"), shopDomain);
      return { success: true, message: "Creator deleted." };
    }

    if (intent === "bulkDelete") {
      const ids = JSON.parse(readText(formData, "ids") || "[]");
      if (!Array.isArray(ids) || ids.length === 0) {
        return { success: false, error: "No creators selected for deletion." };
      }
      await deleteInfluencers(ids, shopDomain);
      return { success: true, message: `Successfully deleted ${ids.length} creator(s).` };
    }

    return { success: false, error: "Unknown action." };
  } catch (error) {
    return { success: false, error: error.message || "Operation failed." };
  }
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

const LEVEL_LABELS = {
  AMBASSADOR_1: "Ambassador Level 1",
  AMBASSADOR_2: "Ambassador Level 2",
  AMBASSADOR_3: "Ambassador Level 3",
  NONE: "Not Qualified",
};


export default function InfluencersOverview() {
  const { influencers } = useLoaderData();
  const actionData = useActionData();
  const navigate = useNavigate();
  const submit = useSubmit();
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  useEffect(() => {
    if (!actionData) return;
    if (actionData.success) {
      setSuccessMessage(actionData.message || "Operation successful.");
      setShowSuccessBanner(true);
      setPendingDelete(null);
      const timer = setTimeout(() => setShowSuccessBanner(false), 3000);
      return () => clearTimeout(timer);
    }
    if (actionData.error) {
      setSuccessMessage(actionData.error);
      setShowSuccessBanner(true);
      setPendingDelete(null);
    }
  }, [actionData]);

  const filtered = influencers.filter((item) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      item.name?.toLowerCase().includes(q) ||
      item.company?.toLowerCase().includes(q) ||
      item.email?.toLowerCase().includes(q) ||
      item.location?.toLowerCase().includes(q)
    );
  });

  const {
    selectedResources: selectedItems,
    allResourcesSelected,
    handleSelectionChange,
    clearSelection,
  } = Polaris.useIndexResourceState(filtered, {
    resourceIDResolver: (item) => item.id,
  });

  const handleNavigateToNew = () => navigate("/app/influencers/new");
  const handleViewDetail = (id) => navigate(`/app/influencers/${id}`);
  const handleDelete = (id, name) => setPendingDelete({ id, name });

  const confirmDelete = () => {
    if (!pendingDelete) return;
    submit({ intent: "delete", id: pendingDelete.id }, { method: "post" });
    setPendingDelete(null);
  };

  const handleBulkDelete = () => {
    if (selectedItems.length > 0) {
      setShowBulkDeleteModal(true);
    }
  };

  const confirmBulkDelete = () => {
    submit(
      { intent: "bulkDelete", ids: JSON.stringify(selectedItems) },
      { method: "post" },
    );
    setShowBulkDeleteModal(false);
    clearSelection();
  };

  const getStatusBadge = (status) => {
    const toneMap = {
      APPLIED: "info",
      CONTACTED: "info",
      CALL_SCHEDULED: "warning",
      UNDER_REVIEW: "warning",
      APPROVED: "success",
      REJECTED: "critical",
      ACTIVE_AMBASSADOR: "success",
      PAST_PARTNER: "attention",
    };
    return <Polaris.Badge tone={toneMap[status] || "info"}>{STATUS_LABELS[status] || status}</Polaris.Badge>;
  };

  const getLevelBadge = (level) => {
    const toneMap = {
      AMBASSADOR_1: "success",
      AMBASSADOR_2: "success",
      AMBASSADOR_3: "info",
      NONE: "attention",
    };
    return <Polaris.Badge tone={toneMap[level] || "info"}>{LEVEL_LABELS[level] || level}</Polaris.Badge>;
  };

  const formatNumber = (num) => (num ? num.toLocaleString() : "0");


  return (
    <div className={styles.pageContainer}>
      <Polaris.Page
        title="Creator Overview"
        primaryAction={
          <Polaris.Button variant="primary" onClick={handleNavigateToNew}>
            Add Creator
          </Polaris.Button>
        }
      >
      <Polaris.Layout>
        <DeleteConfirmDialog
          isOpen={pendingDelete !== null}
          influencerName={pendingDelete?.name}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />

        <Polaris.Modal
          open={showBulkDeleteModal}
          onClose={() => setShowBulkDeleteModal(false)}
          title="Confirm Bulk Delete"
          primaryAction={{
            content: `Confirm Delete (${selectedItems.length})`,
            onAction: confirmBulkDelete,
            destructive: true,
          }}
          secondaryActions={[
            {
              content: "Cancel",
              onAction: () => setShowBulkDeleteModal(false),
            },
          ]}
        >
          <Polaris.Modal.Section>
            <Polaris.BlockStack gap="200">
              <Polaris.Text as="p">
                Are you sure you want to delete the selected <strong>{selectedItems.length} creator(s)</strong>?
              </Polaris.Text>
              <Polaris.Text as="p" tone="subdued">
                This action cannot be undone, and all selected creator data will be permanently removed.
              </Polaris.Text>
            </Polaris.BlockStack>
          </Polaris.Modal.Section>
        </Polaris.Modal>

        {showSuccessBanner && (
          <Polaris.Layout.Section>
            <Polaris.Banner tone={actionData?.error ? "critical" : "success"} onDismiss={() => setShowSuccessBanner(false)}>
              <p>{successMessage}</p>
            </Polaris.Banner>
          </Polaris.Layout.Section>
        )}

        <Polaris.Layout.Section>
          <Polaris.Card>
            <Polaris.TextField
              label="Search Creators"
              labelHidden
              value={query}
              onChange={(value) => {
                setQuery(value);
                setSearchParams(value ? { q: value } : {});
              }}
              placeholder="Search name, company, email, or region..."
              autoComplete="off"
            />
          </Polaris.Card>
        </Polaris.Layout.Section>


        <Polaris.Layout.Section>
          <Polaris.Card>
            <div style={{ width: '100%', overflow: 'hidden' }}>
              <Polaris.IndexTable
                resourceName={{ singular: "creator", plural: "creators" }}
                itemCount={filtered.length}
                selectedItemsCount={allResourcesSelected ? "All" : selectedItems.length}
                onSelectionChange={handleSelectionChange}
                selectable
                columnContentTypes={[
                  'text',
                  'text',
                  'text',
                  'text',
                  'numeric',
                  'text',
                  'text',
                  'text',
                ]}
                headings={[
                  { title: "Name" },
                  { title: "Company/Channel" },
                  { title: "Email" },
                  { title: "Region" },
                  { title: "Total Followers" },
                  { title: "Level" },
                  { title: "Status" },
                  { title: "Actions" },
                ]}
                promotedBulkActions={[
                  {
                    content: `Delete (${selectedItems.length})`,
                    onAction: handleBulkDelete,
                    destructive: true,
                    disabled: selectedItems.length === 0,
                  },
                ]}
              >
                {filtered.map((item, index) => (
                  <Polaris.IndexTable.Row
                    id={item.id}
                    key={item.id}
                    position={index}
                    selected={selectedItems.includes(item.id)}
                  >
                    <Polaris.IndexTable.Cell>
                      <Polaris.Button variant="monochromePlain" onClick={() => handleViewDetail(item.id)}>
                        <Polaris.Text fontWeight="medium">{item.name || "-"}</Polaris.Text>
                      </Polaris.Button>
                    </Polaris.IndexTable.Cell>
                    <Polaris.IndexTable.Cell>
                      <Polaris.Text tone="subdued" truncate>{item.company || "-"}</Polaris.Text>
                    </Polaris.IndexTable.Cell>
                    <Polaris.IndexTable.Cell>
                      <Polaris.Text tone="subdued" truncate>{item.email || "-"}</Polaris.Text>
                    </Polaris.IndexTable.Cell>
                    <Polaris.IndexTable.Cell>
                      <div style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <Polaris.Text tone="subdued">{item.location || "-"}</Polaris.Text>
                      </div>
                    </Polaris.IndexTable.Cell>
                    <Polaris.IndexTable.Cell>
                      <Polaris.Text variant="headingMd" alignment="end">
                        {formatNumber(item.totalFollowers)}
                      </Polaris.Text>
                    </Polaris.IndexTable.Cell>
                    <Polaris.IndexTable.Cell>
                      <div style={{ minWidth: '100px' }}>
                        {getLevelBadge(item.ambassadorLevel)}
                      </div>
                    </Polaris.IndexTable.Cell>
                    <Polaris.IndexTable.Cell>
                      <div style={{ minWidth: '120px' }}>
                        {getStatusBadge(item.collaborationStatus)}
                      </div>
                    </Polaris.IndexTable.Cell>
                    <Polaris.IndexTable.Cell>
                      <Polaris.InlineStack gap="100" wrap={false}>
                        <Polaris.Button size="slim" onClick={() => handleViewDetail(item.id)}>
                          View
                        </Polaris.Button>
                        <Polaris.Button size="slim" tone="critical" onClick={() => handleDelete(item.id, item.name)}>
                          Delete
                        </Polaris.Button>
                      </Polaris.InlineStack>
                    </Polaris.IndexTable.Cell>
                  </Polaris.IndexTable.Row>
                ))}
              </Polaris.IndexTable>
            </div>
          </Polaris.Card>
        </Polaris.Layout.Section>
      </Polaris.Layout>
    </Polaris.Page>
    </div>
  );
}
