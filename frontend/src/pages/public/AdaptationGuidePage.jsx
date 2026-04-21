import PublicLayout from "../../layouts/PublicLayout";
import "../../styles/adaptation-guide.css";
import { CircleAlert, CircleCheck } from "lucide-react";
import AccordionItem from "../../components/ui/AccordionItem";
import { quickTips, guideSections } from "../../constants/adaptationGuideData";
import { useI18n } from "../../context/I18nContext";

function AdaptationGuidePage() {
  const { t } = useI18n();

  return (
    <PublicLayout>
      <div className="adaptation-page">
        <section className="guide-hero">
          <div className="container">
            <h1>{t("guide.hero.title")}</h1>
            <p>{t("guide.hero.text")}</p>
          </div>
        </section>

        <section className="guide-content">
          <div className="container">
            <div className="quick-tips-box">
              <div className="quick-tips-header">
                <CircleAlert size={18} />
                <h2>{t("guide.quickTips.title")}</h2>
              </div>

              <ul className="tips-list">
                {quickTips.map((tip, index) => (
                  <li key={index}>
                    <CircleCheck size={16} />
                    <span>{t(tip)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="guide-grid">
              {guideSections.map((section, index) => {
                const Icon = section.icon;

                return (
                  <div className="guide-card" key={index}>
                    <div className="guide-card-header">
                      <div className="guide-icon">
                        <Icon size={22} />
                      </div>

                      <div>
                        <h3>{t(section.titleKey)}</h3>
                        <p>{t(section.subtitleKey)}</p>
                      </div>
                    </div>

                    <div className="guide-accordion">
                      {section.items.map((item, itemIndex) => (
                        <AccordionItem
                          key={itemIndex}
                          title={t(item.titleKey)}
                          content={t(item.contentKey)}
                          link={item.link}
                          links={item.links}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
      </section>
          <section className="guide-help-section">
          <div className="container">
            <h2>{t("guide.help.title")}</h2>
            <p>{t("guide.help.text")}</p>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}

export default AdaptationGuidePage;
