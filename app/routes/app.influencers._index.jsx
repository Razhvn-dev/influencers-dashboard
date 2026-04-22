import { useEffect, useMemo, useState } from "react";
import { useActionData, useLoaderData, useNavigate, useSubmit } from "react-router";
import * as Polaris from "@shopify/polaris";

import { DeleteConfirmDialog } from "../components/DeleteConfirmDialog";
import { authenticate } from "../shopify.server";
import { deleteInfluencer, getInfluencers, getShopStats } from "../models/influencer.server";
import styles from "../app.influencers._index.styles.module.css";

const DEV_MODE = process.env.DEV_MODE === "true";
const DEV_SHOP = "dev-shop.myshopify.com";
const ITEMS_PER_PAGE = 10;

const STATUS_OPTIONS = [
  { label: "All Status", value: "ALL" },
  { label: "Applied", value: "APPLIED" },
  { label: "Contacted", value: "CONTACTED" },
  { label: "Call Scheduled", value: "CALL_SCHEDULED" },
  { label: "Under Review", value: "UNDER_REVIEW" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Active Ambassador", value: "ACTIVE_AMBASSADOR" },
  { label: "Past Partner", value: "PAST_PARTNER" },
];

const LEVEL_OPTIONS = [
  { label: "All Levels", value: "ALL" },
  { label: "Ambassador Level 1", value: "AMBASSADOR_1" },
  { label: "Ambassador Level 2", value: "AMBASSADOR_2" },
  { label: "Ambassador Level 3", value: "AMBASSADOR_3" },
  { label: "Not Qualified", value: "NONE" },
];

function readText(formData, key) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export const loader = async ({ request }) => {
  const shopDomain = DEV_MODE ? DEV_SHOP : (await authenticate.admin(request)).session.shop;
  // 并行获取创作者列表和统计信息
  const [influencers, stats] = await Promise.all([
    getInfluencers(shopDomain),
    getShopStats(shopDomain),
  ]);
  return { influencers, stats };
};

export const action = async ({ request }) => {
  const shopDomain = DEV_MODE ? DEV_SHOP : (await authenticate.admin(request)).session.shop;
  const formData = await request.formData();
  const intent = readText(formData, "intent");

  try {
    if (intent === "delete") {
      await deleteInfluencer(readText(formData, "id"), shopDomain);
      return { success: true, message: "Creator deleted successfully" };
    }
    return { success: false, error: "Unknown action" };
  } catch (error) {
    return { success: false, error: error.message || "Operation failed" };
  }
};

function formatCompact(num) {
  if (!num) return "0";
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

export default function InfluencersIndex() {
  const { influencers, stats } = useLoaderData();
  const actionData = useActionData();
  const navigate = useNavigate();
  const submit = useSubmit();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [level, setLevel] = useState("ALL");
  const [location, setLocation] = useState("ALL");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [banner, setBanner] = useState({ show: false, tone: "success", message: "" });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!actionData) return;
    if (actionData.success) {
      setBanner({ show: true, tone: "success", message: actionData.message || "Operation successful" });
    } else if (actionData.error) {
      setBanner({ show: true, tone: "critical", message: actionData.error });
    }
  }, [actionData]);

  // 重置页码到第一页
  useEffect(() => {
    setCurrentPage(1);
  }, [query, status, level, location]);

  // 分页时平滑滚动到页面最上方
  useEffect(() => {
    // 使用 requestAnimationFrame 确保在浏览器重绘前执行滚动
    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }, [currentPage]);

  const locationOptions = useMemo(
    () => [
      { label: "All Regions", value: "ALL" },
      ...Array.from(
        new Set(
          influencers
            .map((item) => (item.location || "").trim())
            .filter((item) => item.length > 0),
        ),
      )
        .sort((a, b) => a.localeCompare(b))
        .map((item) => ({ label: item, value: item })),
    ],
    [influencers],
  );

  const filtered = useMemo(() => {
    const searchText = query.trim().toLowerCase();
    return influencers.filter((item) => {
      const matchesQuery =
        !searchText ||
        item.name?.toLowerCase().includes(searchText) ||
        item.company?.toLowerCase().includes(searchText) ||
        item.email?.toLowerCase().includes(searchText) ||
        item.location?.toLowerCase().includes(searchText);

      const matchesStatus = status === "ALL" || item.collaborationStatus === status;
      const matchesLevel = level === "ALL" || item.ambassadorLevel === level;
      const matchesLocation = location === "ALL" || item.location === location;

      return matchesQuery && matchesStatus && matchesLevel && matchesLocation;
    });
  }, [influencers, query, status, level, location]);

  // 分页计算
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedData = filtered.slice(startIndex, endIndex);

  return (
    <div className={styles.pageContainer}>
      <Polaris.Page
        title="Creator Dashboard"
        primaryAction={{
          content: "Add Creator",
          onAction: () => navigate("/app/influencers/new"),
        }}
      >
        <Polaris.Layout>
          <DeleteConfirmDialog
            isOpen={pendingDelete !== null}
            influencerName={pendingDelete?.name}
            onCancel={() => setPendingDelete(null)}
            onConfirm={() => {
              if (!pendingDelete) return;
              submit({ intent: "delete", id: pendingDelete.id }, { method: "post" });
              setPendingDelete(null);
            }}
          />

          {banner.show && (
            <Polaris.Layout.Section>
              <Polaris.Banner tone={banner.tone} onDismiss={() => setBanner((b) => ({ ...b, show: false }))}>
                <p>{banner.message}</p>
              </Polaris.Banner>
            </Polaris.Layout.Section>
          )}

          <Polaris.Layout.Section>
            <Polaris.Card>
              <Polaris.InlineGrid columns={{ xs: 2, sm: 4 }} gap="300">
                <Polaris.Box padding="300" className={styles.statCard}>
                  <Polaris.Text as="p" tone="subdued" variant="bodySm">Total Creators</Polaris.Text>
                  <Polaris.Text as="p" variant="headingLg">{stats.totalInfluencers}</Polaris.Text>
                </Polaris.Box>
                <Polaris.Box padding="300" className={styles.statCard}>
                  <Polaris.Text as="p" tone="subdued" variant="bodySm">Total Followers</Polaris.Text>
                  <Polaris.Text as="p" variant="headingLg">{formatCompact(stats.totalFollowers)}</Polaris.Text>
                </Polaris.Box>
                <Polaris.Box padding="300" className={styles.statCard}>
                  <Polaris.Text as="p" tone="subdued" variant="bodySm">Pending</Polaris.Text>
                  <Polaris.Text as="p" variant="headingLg">{stats.pendingCount}</Polaris.Text>
                </Polaris.Box>
                <Polaris.Box padding="300" className={styles.statCard}>
                  <Polaris.Text as="p" tone="subdued" variant="bodySm">Active Ambassadors</Polaris.Text>
                  <Polaris.Text as="p" variant="headingLg">{stats.activeAmbassadors}</Polaris.Text>
                </Polaris.Box>
              </Polaris.InlineGrid>
            </Polaris.Card>
          </Polaris.Layout.Section>

          <Polaris.Layout.Section>
            <Polaris.Card>
              <Polaris.InlineGrid columns={{ xs: 1, sm: 2, md: 4 }} gap="300">
                <Polaris.TextField
                  label="Search"
                  labelHidden
                  value={query}
                  onChange={setQuery}
                  placeholder="Search name, company, email, or region"
                  autoComplete="off"
                />
                <Polaris.Select label="Status" labelHidden options={STATUS_OPTIONS} value={status} onChange={setStatus} />
                <Polaris.Select label="Level" labelHidden options={LEVEL_OPTIONS} value={level} onChange={setLevel} />
                <Polaris.Select label="Region" labelHidden options={locationOptions} value={location} onChange={setLocation} />
              </Polaris.InlineGrid>
            </Polaris.Card>
          </Polaris.Layout.Section>

          <Polaris.Layout.Section>
            <Polaris.Card id="influencer-table">
              <Polaris.BlockStack gap="200">
                {paginatedData.map((item) => (
                  <Polaris.Box key={item.id} padding="300" borderRadius="200" background="surface-subdued" className={styles.creatorCard}>
                    <Polaris.InlineStack align="space-between" blockAlign="center">
                      <Polaris.BlockStack gap="100">
                        <Polaris.Text as="p" fontWeight="medium">{item.name}</Polaris.Text>
                        <Polaris.Text as="p" tone="subdued" variant="bodySm">
                          {item.company || "-"} | {item.email || "-"} | {item.location || "-"}
                        </Polaris.Text>
                      </Polaris.BlockStack>
                      <Polaris.InlineStack gap="200">
                        <Polaris.Button size="slim" className={styles.actionButton} onClick={() => navigate(`/app/influencers/${item.id}`)}>View</Polaris.Button>
                        <Polaris.Button size="slim" tone="critical" className={styles.actionButton} onClick={() => setPendingDelete({ id: item.id, name: item.name })}>
                          Delete
                        </Polaris.Button>
                      </Polaris.InlineStack>
                    </Polaris.InlineStack>
                  </Polaris.Box>
                ))}
                {filtered.length === 0 && (
                  <Polaris.EmptyState
                    heading="No matching results"
                    action={{ content: "Clear Filters", onAction: () => { setQuery(""); setStatus("ALL"); setLevel("ALL"); setLocation("ALL"); } }}
                  >
                    <p>Try different keywords or filter criteria.</p>
                  </Polaris.EmptyState>
                )}
              </Polaris.BlockStack>
            </Polaris.Card>
          </Polaris.Layout.Section>

          {/* 分页控件 - 放在表格下方居中 */}
          {filtered.length > ITEMS_PER_PAGE && (
            <Polaris.Layout.Section>
              <Polaris.Box paddingBlockStart="400" paddingBlockEnd="200">
                <div className={styles.paginationContainer} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Polaris.Pagination
                    label={`Showing ${startIndex + 1}-${Math.min(endIndex, filtered.length)} of ${filtered.length} creators`}
                    hasPrevious={currentPage > 1}
                    onPrevious={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    hasNext={currentPage < totalPages}
                    onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  />
                </div>
              </Polaris.Box>
            </Polaris.Layout.Section>
          )}
        </Polaris.Layout>
      </Polaris.Page>
    </div>
  );
}
