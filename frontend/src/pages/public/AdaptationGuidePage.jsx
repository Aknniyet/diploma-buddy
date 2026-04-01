import PublicLayout from "../../layouts/PublicLayout";
import "../../styles/adaptation-guide.css";
import { CircleAlert, CircleCheck } from "lucide-react";
import AccordionItem from "../../components/ui/AccordionItem";
import { quickTips, guideSections } from "../../constants/adaptationGuideData";

function AdaptationGuidePage() {
  return (
    <PublicLayout>
      <div className="adaptation-page">
        <section className="guide-hero">
          <div className="container">
            <h1>Adaptation Guide for Kazakhstan</h1>
            <p>
              Your comprehensive guide to settling into student life in Kazakhstan.
            </p>
          </div>
        </section>

        <section className="guide-content">
          <div className="container">
            <div className="quick-tips-box">
              <div className="quick-tips-header">
                <CircleAlert size={18} />
                <h2>Quick Tips for Your First Week</h2>
              </div>

              <ul className="tips-list">
                {quickTips.map((tip, index) => (
                  <li key={index}>
                    <CircleCheck size={16} />
                    <span>{tip}</span>
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
                        <h3>{section.title}</h3>
                        <p>{section.subtitle}</p>
                      </div>
                    </div>

                    <div className="guide-accordion">
                      {section.items.map((item, itemIndex) => (
                        <AccordionItem
                          key={itemIndex}
                          title={item.title}
                          content={item.content}
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
            <h2>Need Personalized Help?</h2>
            <p>
              Sign up for KazakhBuddy and get matched with a local Kazakh
              student who can guide you through each step of your adaptation
              journey.
            </p>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}

export default AdaptationGuidePage;