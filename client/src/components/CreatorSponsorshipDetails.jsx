import { useMemo } from 'react';
import { FormLayout, Select, TextField } from '@shopify/polaris';
import { ContractIcon, HashtagIcon, OrderIcon, ProductIcon } from '@shopify/polaris-icons';
import { COMMISSION_OPTIONS } from '../constants';
import CreatorSectionCard from './CreatorSectionCard';
import FieldRow from './FieldRow';

function display(value) {
  const text = String(value ?? '').trim();
  return text || 'Not set';
}

function hasDisplayValue(value) {
  const text = String(value ?? '').trim();
  return Boolean(text) && text !== 'Not set' && text !== 'Not selected' && text !== '—';
}

export default function CreatorSponsorshipDetails({
  form,
  onChange,
  editing = false,
}) {
  const updateField = (field) => (value) => {
    onChange({ ...form, [field]: value });
  };

  const readRows = useMemo(
    () =>
      [
        hasDisplayValue(form.sponsored_products)
          ? {
              key: 'products',
              node: (
                <FieldRow
                  icon={ProductIcon}
                  label="Sponsored Product(s)"
                  value={display(form.sponsored_products)}
                  multiline
                />
              ),
            }
          : null,
        hasDisplayValue(form.order_numbers)
          ? {
              key: 'orders',
              node: (
                <FieldRow
                  icon={OrderIcon}
                  label="Order #'s"
                  value={display(form.order_numbers)}
                  multiline
                />
              ),
            }
          : null,
        hasDisplayValue(form.required_deliverables)
          ? {
              key: 'deliverables',
              node: (
                <FieldRow
                  icon={HashtagIcon}
                  label="Required Deliverables"
                  value={display(form.required_deliverables)}
                  multiline
                />
              ),
            }
          : null,
        hasDisplayValue(form.commission)
          ? {
              key: 'commission',
              node: (
                <FieldRow icon={HashtagIcon} label="Commission" value={display(form.commission)} />
              ),
            }
          : null,
        hasDisplayValue(form.contract_status)
          ? {
              key: 'contract',
              node: (
                <FieldRow icon={ContractIcon} label="Contract" value={display(form.contract_status)} />
              ),
            }
          : null,
      ].filter(Boolean),
    [form]
  );

  const readContent =
    readRows.length > 0 ? (
      <div className="crm-field-row-list crm-field-row-list--compact">
        {readRows.map((row) => (
          <div key={row.key}>{row.node}</div>
        ))}
      </div>
    ) : (
      <p className="crm-detail-empty-state">No sponsorship details yet. Edit creator to add information.</p>
    );

  const editContent = (
    <FormLayout>
      <TextField
        label="Sponsored Product(s)"
        value={form.sponsored_products}
        onChange={updateField('sponsored_products')}
        multiline={3}
        autoComplete="off"
      />
      <TextField
        label="Order #'s"
        value={form.order_numbers}
        onChange={updateField('order_numbers')}
        multiline={2}
        autoComplete="off"
      />
      <TextField
        label="Required Deliverables per contract"
        value={form.required_deliverables}
        onChange={updateField('required_deliverables')}
        multiline={3}
        autoComplete="off"
      />
      <Select
        label="Commission"
        options={COMMISSION_OPTIONS}
        value={form.commission}
        onChange={updateField('commission')}
      />
      <TextField
        label="Contract"
        value={form.contract_status}
        onChange={updateField('contract_status')}
        autoComplete="off"
        placeholder="Contract status or signed date"
      />
    </FormLayout>
  );

  return (
    <CreatorSectionCard
      title="Sponsorship Details"
      editing={editing}
      readContent={readContent}
      editContent={editContent}
    />
  );
}
