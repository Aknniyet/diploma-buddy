import PublicLayout from "../../layouts/PublicLayout";
import "../../styles/adaptation-guide.css";
import AccordionItem from "../../components/ui/AccordionItem";
import { guideSections } from "../../constants/adaptationGuideData";
import { useI18n } from "../../context/I18nContext";

function AdaptationGuidePage() {
  const { t } = useI18n();

  return (
    <PublicLayout>
      <div className="adaptation-page">
        <section className="guide-content">
          <div className="container">
            <section className="guide-details-section">
              <div className="guide-section-heading compact">
                <span>{t("guide.details.eyebrow")}</span>
                <h2>{t("guide.details.title")}</h2>
                <p>{t("guide.details.text")}</p>
              </div>

              <div className="guide-grid">
                {guideSections.map((section) => {
                  const Icon = section.icon;

                  return (
                    <div className="guide-card" key={section.titleKey}>
                      <div className="guide-card-header">
                        <div className="guide-icon">
                          <Icon size={22} />
                        </div>

                        <div>
                          <span className="guide-tag">{t(section.tagKey)}</span>
                          <h3>{t(section.titleKey)}</h3>
                          <p>{t(section.subtitleKey)}</p>
                        </div>
                      </div>

                      <div className="guide-accordion">
                        {section.items.map((item) => (
                          <AccordionItem
                            key={item.titleKey}
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
            </section>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}

export default AdaptationGuidePage;
