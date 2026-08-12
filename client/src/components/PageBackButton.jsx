import { Icon } from '@shopify/polaris';
import { ArrowLeftIcon } from '@shopify/polaris-icons';

export default function PageBackButton({ label, onClick }) {
  return (
    <button type="button" className="crm-page-back" onClick={onClick}>
      <Icon source={ArrowLeftIcon} />
      <span>{label}</span>
    </button>
  );
}
