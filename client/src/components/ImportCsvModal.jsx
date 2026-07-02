import { useState } from 'react';
import { Banner, BlockStack, Modal, Text } from '@shopify/polaris';
import { importSponsorshipCsv } from '../api';

export default function ImportCsvModal({ open, onClose, onImported }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const csvText = await file.text();
      const result = await importSponsorshipCsv(csvText);
      onImported(result);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to import CSV');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Import Sponsorship CSV"
      primaryAction={{
        content: loading ? 'Importing...' : 'Choose CSV File',
        onAction: () => document.getElementById('sponsorship-csv-input')?.click(),
        loading,
      }}
      secondaryActions={[{ content: 'Cancel', onAction: onClose, disabled: loading }]}
    >
      <Modal.Section>
        <BlockStack gap="300">
          {error ? (
            <Banner tone="critical" title="Import failed">
              <p>{error}</p>
            </Banner>
          ) : null}
          <Text as="p" variant="bodyMd">
            Upload the same spreadsheet export your team uses today. Column order must
            match the Sponsorship Progress Tracking sheet.
          </Text>
          <input
            id="sponsorship-csv-input"
            type="file"
            accept=".csv,text/csv"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
