import { FormLayout, Select, TextField } from '@shopify/polaris';
import { COMMISSION_OPTIONS } from '../constants';
import CreatorSectionCard from './CreatorSectionCard';

function display(value) {
  const text = String(value ?? '').trim();
  return text || 'Not set';
}

export default function CreatorSponsorshipDetails({
  form,
  onChange,
  editing = false,
  onEdit,
  onDone,
}) {
  const updateField = (field) => (value) => {
    onChange({ ...form, [field]: value });
  };

  const readContent = (
    <div className="crm-detail-sponsorship-grid">
      <div>
        <span>Sponsored Product(s)</span>
        <strong>{display(form.sponsored_products)}</strong>
      </div>
      <div>
        <span>Order #'s</span>
        <strong>{display(form.order_numbers)}</strong>
      </div>
      <div>
        <span>Required Deliverables</span>
        <strong>{display(form.required_deliverables)}</strong>
      </div>
      <div>
        <span>Commission</span>
        <strong>{display(form.commission)}</strong>
      </div>
      <div>
        <span>Contract</span>
        <strong>{display(form.contract_status)}</strong>
      </div>
    </div>
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
      onEdit={onEdit}
      onDone={onDone}
      readContent={readContent}
      editContent={editContent}
    />
  );
}
