import "../../styles/footer.css";
import { useI18n } from "../../context/I18nContext";

function Footer() {
  const { t } = useI18n();

  return (
    <footer className="footer">
      <div className="container footer-content">

        <div className="footer-column">
          <h3>{t("common.brand")}</h3>
          <p>{t("footer.description")}</p>
        </div>

        <div className="footer-column">
          <h4>{t("footer.quickLinks")}</h4>
          <a href="/about">{t("nav.about")}</a>
          <a href="/guide">{t("nav.guide")}</a>
          <a href="/signup">{t("footer.joinAsStudent")}</a>
        </div>

        <div className="footer-column">
          <h4>{t("footer.contact")}</h4>
          <p>support@kazakhbuddy.kz</p>
          <p>Astana, Kazakhstan</p>
        </div>

      </div>

      <div className="footer-bottom">
        © 2026 {t("common.brand")}. {t("footer.madeForStudents")}
      </div>
    </footer>
  );
}

export default Footer;
