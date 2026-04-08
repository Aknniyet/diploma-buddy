import PublicLayout from "../../layouts/PublicLayout";
import { Users } from "lucide-react";
import { aboutFeatures, aboutValues } from "../../constants/aboutData";
import "../../styles/about.css";

function AboutPage() {
  return (
    <PublicLayout>
      <section className="about-page">
        <section className="about-hero">
          <div className="container about-hero-content">
            <h1>About KazakhBuddy</h1>
            <p>
              KazakhBuddy is a web-based platform created to support
              international students during their adaptation to university life
              in Kazakhstan.
            </p>
          </div>
        </section>

        <section className="about-section">
          <div className="container about-grid">
            <div className="about-text-block">
              <h2>About the Platform</h2>
              <p>
                KazakhBuddy is designed as a structured digital space where
                students can build helpful peer connections. Through the
                platform, international students can find local buddies,
                communicate with them, and receive support in both practical and
                social aspects of adaptation.
              </p>
              <p>
                This project was developed to address common difficulties faced
                by international students, including limited local knowledge,
                lack of personal support, and challenges in adjusting to a new
                academic and cultural environment.
              </p>
              <p>
                By offering a simple and user-friendly space for communication
                and guidance, KazakhBuddy aims to make the transition to
                student life in Kazakhstan less stressful and more welcoming.
              </p>
            </div>

            <div className="about-feature-cards">
              {aboutFeatures.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div className="about-feature-card" key={feature.id}>
                    <div className="about-feature-icon">
                      <Icon size={20} />
                    </div>
                    <h3>{feature.title}</h3>
                    <p>{feature.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="about-section light-section">
          <div className="container about-center-block">
            <h2>Why It Matters</h2>
            <p>
              Adapting to a new country is not only about documents and housing.
              It is also about feeling understood, welcomed, and connected. Many
              international students face language barriers, unfamiliar systems,
              and social isolation during their first months at university.
            </p>
            <p>
              KazakhBuddy aims to reduce these difficulties by creating a more
              supportive environment where students can receive help from peers
              who understand the local context and student life in Kazakhstan.
            </p>
          </div>
        </section>

        <section className="about-section">
          <div className="container">
            <div className="about-section-heading">
              <h2>Our Values</h2>
              <p>These principles guide the purpose of KazakhBuddy.</p>
            </div>

            <div className="about-values-grid">
              {aboutValues.map((value) => {
                const Icon = value.icon;

                return (
                  <div className="about-value-card" key={value.id}>
                    <div className="about-value-icon">
                      <Icon size={20} />
                    </div>
                    <h3>{value.title}</h3>
                    <p>{value.text}</p>
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
            <h2>Supporting Student Adaptation in Kazakhstan</h2>
            <p>
              KazakhBuddy is more than just a platform for finding a buddy. It
              is a step toward building a more inclusive, supportive, and
              connected student experience in Kazakhstan.
            </p>
          </div>
        </section>
      </section>
    </PublicLayout>
  );
}

export default AboutPage;