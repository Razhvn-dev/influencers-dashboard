import { Button } from '@shopify/polaris';
import { LanguageIcon } from '@shopify/polaris-icons';
import { useTranslation } from '../i18n/LanguageContext.jsx';

export default function LanguageSwitcher({ className }) {
  const { locale, toggleLocale, t } = useTranslation();

  const label = locale === 'zh' ? t('language.switchToEnglish') : t('language.switchToChinese');

  return (
    <Button
      icon={LanguageIcon}
      onClick={toggleLocale}
      accessibilityLabel={t('language.label')}
      className={className}
    >
      {label}
    </Button>
  );
}
