import * as Polaris from "@shopify/polaris";

/**
 * Custom delete confirmation dialog
 * Features: Can only be closed by clicking "Cancel", "Delete", or the × button, not by clicking background
 */
export function DeleteConfirmDialog({
  isOpen,
  influencerName,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          width: "100%",
          maxWidth: "520px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          overflow: "hidden",
        }}
      >
        {/* Dialog header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Polaris.Text as="h2" variant="headingMd">
            Confirm Deletion
          </Polaris.Text>
          <button
            onClick={onCancel}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "4px",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f3f4f6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            aria-label="Close"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 5L5 15M5 5L15 15"
                stroke="#6b7280"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Dialog content */}
        <Polaris.Box padding="400">
          <Polaris.BlockStack gap="300">
            <Polaris.Text as="p">
              Are you sure you want to delete <strong>{influencerName}</strong>?
            </Polaris.Text>
            <Polaris.Text as="p" tone="subdued">
              This action cannot be undone and the creator's data will be permanently removed.            </Polaris.Text>
          </Polaris.BlockStack>
        </Polaris.Box>

        {/* Dialog footer action buttons */}
        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid #e5e7eb",
            backgroundColor: "#f9fafb",
            display: "flex",
            justifyContent: "flex-end",
            gap: "8px",
          }}
        >
          <Polaris.Button onClick={onCancel}>Cancel</Polaris.Button>
          <Polaris.Button variant="primary" tone="critical" onClick={onConfirm}>
            Delete
          </Polaris.Button>
        </div>
      </div>
    </div>
  );
}
