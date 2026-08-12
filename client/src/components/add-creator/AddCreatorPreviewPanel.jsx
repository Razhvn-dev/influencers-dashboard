import CreatorPreviewCard from './CreatorPreviewCard';

export default function AddCreatorPreviewPanel({ form, platformPreview, nextFollowupAt }) {
  return (
    <div className="crm-add-creator__preview-stack">
      <CreatorPreviewCard
        form={form}
        platformPreview={platformPreview}
        nextFollowupAt={nextFollowupAt}
      />
    </div>
  );
}
