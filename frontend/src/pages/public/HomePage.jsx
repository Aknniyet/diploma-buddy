import PublicLayout from "../../layouts/PublicLayout";
import "../../styles/home.css";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { homeFeatures, homeSteps, homeTestimonials, } from "../../constants/homeData";

function HomePage() {
  const navigate = useNavigate();

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
              <div className="hero-badge">
                Connecting Students in Kazakhstan
              </div>

              <h1 className="hero-title">
                Your Journey
                <br />
                Starts with a <span>Friend</span>
              </h1>

              <p className="hero-description">
                KazakhBuddy helps international students adapt to university
                life in Kazakhstan by connecting them with local student buddies
                for guidance, support, and friendship.
              </p>

              <div className="hero-buttons">
                <button className="primary-btn" onClick={handleInternationalSignup}>
                  Get Started
                </button>

                <button className="secondary-btn" onClick={handleLearnMore}>
                  Learn More
                </button>
              </div>
            </div>

            <div className="hero-right">
              <div className="hero-card-bg"></div>

              <div className="match-card">
                <div className="match-card-header">
                  <h3>Perfect Match Found!</h3>
                  <p>Based on your interests and profile</p>
                </div>

                <div className="match-profile">
                  <div className="match-avatar">A</div>

                  <div className="match-info">
                    <h4>Aigerim S.</h4>
                    <p>Computer Science, Almaty</p>
                  </div>
                </div>

                <div className="match-tags">
                  <span>Photography</span>
                  <span>Hiking</span>
                  <span>Cooking</span>
                </div>

                <button className="match-btn">View Profile</button>
              </div>
            </div>
          </div>
        </section>

        <section className="features-section">
          <div className="container">
            <div className="section-header">
              <h2>Everything You Need to Settle In</h2>
              <p>
                KazakhBuddy provides the tools and support that help students
                feel welcome, safe, and connected from the very beginning.
              </p>
            </div>

            <div className="features-grid">
              {homeFeatures.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <div className="feature-card" key={index}>
                    <div className="feature-icon">
                      <Icon size={24} />
                    </div>

                    <h3>{feature.title}</h3>
                    <p>{feature.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="how-section">
          <div className="container">
            <div className="section-header">
              <h2>How It Works</h2>
              <p>
                Getting started is simple. Follow these steps to find your buddy
                and begin your journey.
              </p>
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

                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="container cta-content">
            <h2>Ready to Find Your Buddy?</h2>
            <p>
              Join KazakhBuddy today and start building friendships that make
              your university journey easier, warmer, and more memorable.
            </p>

            <div className="cta-buttons">
              <button className="cta-primary" onClick={handleInternationalSignup}>
                I’m an International Student
              </button>

              <button className="cta-secondary" onClick={handleBuddySignup}>
                I Want to Be a Buddy
              </button>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}

export default HomePage;