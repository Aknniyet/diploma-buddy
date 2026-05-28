import PublicLayout from "../../layouts/PublicLayout";
import { Users } from "lucide-react";
import { aboutFeatures, aboutValues } from "../../constants/aboutData";
import "../../styles/about.css";
import { useI18n } from "../../context/I18nContext";

function AboutPage() {
  const { t } = useI18n();

  return (
    <PublicLayout>
      <section className="about-page">
        <section className="about-hero">
          <div className="container about-hero-content">
            <h1>{t("about.hero.title")}</h1>
            <p>{t("about.hero.text")}</p>
          </div>
        </section>

        <section className="about-section">
          <div className="container about-grid">
            <div className="about-text-block">
              <h2>{t("about.platform.title")}</h2>
              <p>{t("about.platform.paragraph1")}</p>
              <p>{t("about.platform.paragraph2")}</p>
              <p>{t("about.platform.paragraph3")}</p>
            </div>

            <div className="about-feature-cards">
              {aboutFeatures.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div className="about-feature-card" key={feature.id}>
                    <div className="about-feature-icon">
                      <Icon size={20} />
                    </div>
                    <h3>{t(feature.titleKey)}</h3>
                    <p>{t(feature.textKey)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="about-section light-section">
          <div className="container about-center-block">
            <h2>{t("about.whyItMatters.title")}</h2>
            <p>{t("about.whyItMatters.paragraph1")}</p>
            <p>{t("about.whyItMatters.paragraph2")}</p>
          </div>
        </section>

        <section className="about-section">
          <div className="container">
            <div className="about-section-heading">
              <h2>{t("about.valuesSection.title")}</h2>
              <p>{t("about.valuesSection.text")}</p>
            </div>

            <div className="about-values-grid">
              {aboutValues.map((value) => {
                const Icon = value.icon;

                return (
                  <div className="about-value-card" key={value.id}>
                    <div className="about-value-icon">
                      <Icon size={20} />
                    </div>
                    <h3>{t(value.titleKey)}</h3>
                    <p>{t(value.textKey)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="about-cta-section">
          <div className="container about-cta-content">
            <div className="about-cta-icon">
              <Users size={22} />
            </div>
            <h2>{t("about.cta.title")}</h2>
            <p>{t("about.cta.text")}</p>
          </div>
        </section>
      </section>
    </PublicLayout>
  );
}

export default AboutPage;
