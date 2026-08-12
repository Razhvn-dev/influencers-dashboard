import { useState } from 'react';
import { Banner, BlockStack, Modal, Text } from '@shopify/polaris';
import { importSponsorshipCsv } from '../api';
import { useTranslation } from '../i18n/LanguageContext.jsx';

export default function ImportCsvModal({ open, onClose, onImported }) {
  const { t } = useTranslation();
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
      setError(err.message || t('importCsv.failedFallback'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('importCsv.title')}
      primaryAction={{
        content: loading ? t('importCsv.importing') : t('importCsv.chooseFile'),
        onAction: () => document.getElementById('sponsorship-csv-input')?.click(),
        loading,
      }}
      secondaryActions={[{ content: t('common.cancel'), onAction: onClose, disabled: loading }]}
    >
      <Modal.Section>
        <BlockStack gap="300">
          {error ? (
            <Banner tone="critical" title={t('importCsv.failed')}>
              <p>{error}</p>
            </Banner>
          ) : null}
          <Text as="p" variant="bodyMd">
            {t('importCsv.description')}
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
