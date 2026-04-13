import PublicLayout from "../../layouts/PublicLayout";
import "../../styles/home.css";
import { useNavigate } from "react-router-dom";
import { homeFeatures, homeSteps } from "../../constants/homeData";
import heroFigmaRight from "../../assets/hero-figma-right.png";
import { useI18n } from "../../context/I18nContext";

function HomePage() {
  const navigate = useNavigate();
  const { t, language } = useI18n();

  const handleInternationalSignup = () => {
    navigate("/signup");
  };

  const handleBuddySignup = () => {
    navigate("/signup");
  };

  const handleLearnMore = () => {
    navigate("/about");
  };

  return (
    <PublicLayout>
      <div className="home-page">
        <section className="hero-section">
          <div className="container hero-content">
            <div className="hero-left">
              <div className="hero-badge">{t("home.badge")}</div>

              <h1 className="hero-title">
                {t("home.title1")}
                <br />
                {language === "kz" ? (
                  <>
                    <span>{t("home.title2")}</span> {t("home.titleAccent")}
                  </>
                ) : (
                  <>
                    {t("home.title2")} <span>{t("home.titleAccent")}</span>
                  </>
                )}
              </h1>

              <p className="hero-description">{t("home.description")}</p>

              <div className="hero-buttons">
                <button className="primary-btn" onClick={handleInternationalSignup}>
                  {t("home.getStarted")}
                </button>

                <button className="secondary-btn" onClick={handleLearnMore}>
                  {t("home.learnMore")}
                </button>
              </div>
            </div>

            <div className="hero-right">
              <div className="hero-illustration">
                <div className="hero-cutout-wrap">
                  <img
                    src={heroFigmaRight}
                    alt={t("home.heroAlt")}
                    className="hero-cutout"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="features-section">
          <div className="container">
            <div className="section-header">
              <h2>{t("home.featuresTitle")}</h2>
              <p>{t("home.featuresText")}</p>
            </div>

            <div className="features-grid">
              {homeFeatures.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <div className="feature-card" key={index}>
                    <div className="feature-icon">
                      <Icon size={24} />
                    </div>

                    <h3>{t(feature.titleKey)}</h3>
                    <p>{t(feature.textKey)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="how-section">
          <div className="container">
            <div className="section-header">
              <h2>{t("home.howTitle")}</h2>
              <p>{t("home.howText")}</p>
            </div>

            <div className="steps-grid">
              {homeSteps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <div className="step-card" key={index}>
                    <div className="step-icon-wrapper">
                      <div className="step-icon">
                        <Icon size={22} />
                      </div>

                      <span className="step-number">{step.number}</span>
                    </div>

                    <h3>{t(step.titleKey)}</h3>
                    <p>{t(step.textKey)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="container cta-content">
            <h2>{t("home.ctaTitle")}</h2>
            <p>{t("home.ctaText")}</p>

            <div className="cta-buttons">
              <button className="cta-primary" onClick={handleInternationalSignup}>
                {t("home.ctaInternational")}
              </button>

              <button className="cta-secondary" onClick={handleBuddySignup}>
                {t("home.ctaBuddy")}
              </button>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}

export default HomePage;
