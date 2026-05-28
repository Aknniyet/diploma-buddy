import { useI18n } from "../../context/I18nContext";

function LanguageSwitcher({ className = "" }) {
  const { language, setLanguage, t } = useI18n();

  return (
    <div className={`language-switcher ${className}`.trim()}>
      {["en", "ru", "kz"].map((code) => (
        <button
          key={code}
          type="button"
          className={`language-switcher-button ${language === code ? "active" : ""}`}
          onClick={() => setLanguage(code)}
        >
          {t(`language.${code}`)}
        </button>
      ))}
    </div>
  );
}

export default LanguageSwitcher;
