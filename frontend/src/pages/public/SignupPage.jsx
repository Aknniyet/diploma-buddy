import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Globe, MapPin, Users, ChevronLeft, ChevronRight } from "lucide-react";
import "../../styles/signup.css";
import { apiRequest } from "../../lib/api";
import { isValidEmail } from "../../utils/email";
import { useI18n } from "../../context/I18nContext";
import LanguageSwitcher from "../../components/common/LanguageSwitcher";

function SignupPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    homeCountry: "",
    city: "",
    studyProgram: "",
    languages: "",
    hobbies: "",
    aboutYou: "",
    gender: "",
    genderPreference: "no_preference",
    maxBuddies: "3",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    setError("");

    if (step === 1 && !selectedRole) {
      return setError(t("signup.errors.chooseRole"));
    }

    if (
      step === 2 &&
      (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword)
    ) {
      return setError(t("signup.errors.fillRequired"));
    }

    if (step === 2 && !isValidEmail(formData.email)) {
      return setError(t("signup.errors.invalidEmail"));
    }

    if (step === 2 && formData.password !== formData.confirmPassword) {
      return setError(t("signup.errors.passwordsMismatch"));
    }

    if (step < 3) {
      setStep((prev) => prev + 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isValidEmail(formData.email)) {
      setError(t("signup.errors.invalidEmail"));
      return;
    }

    setIsLoading(true);

    try {
      const data = await apiRequest("/auth/register/start", {
        method: "POST",
        body: JSON.stringify({
          role: selectedRole,
          ...formData,
        }),
      });

      navigate("/verify-email", {
        state: {
          pendingUser: data.pendingUser,
        },
      });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-wrapper">
        <LanguageSwitcher className="auth-language-switcher" />
        <Link to="/" className="signup-brand">
          <div className="signup-brand-icon">
            <Users size={22} />
          </div>
          <h1>KazakhBuddy</h1>
        </Link>

        <div className="signup-card">
          <h2>{t("signup.title")}</h2>
          <p className="signup-step-text">{t("signup.stepOf", { step })}</p>

          <div className="signup-progress">
            <span className={step >= 1 ? "active" : ""}></span>
            <span className={step >= 2 ? "active" : ""}></span>
            <span className={step >= 3 ? "active" : ""}></span>
          </div>

          <form onSubmit={handleSubmit} className="signup-form">
            {step === 1 && (
              <div className="signup-step-content">
                <p className="signup-section-label">{t("signup.iAm")}</p>

                <div className="role-grid">
                  <button
                    type="button"
                    className={`role-card ${selectedRole === "international" ? "selected" : ""}`}
                    onClick={() => setSelectedRole("international")}
                  >
                    <div className="role-icon">
                      <Globe size={28} />
                    </div>
                    <h3>{t("signup.internationalStudent")}</h3>
                    <p>{t("signup.internationalStudentText")}</p>
                  </button>

                  <button
                    type="button"
                    className={`role-card ${selectedRole === "local" ? "selected" : ""}`}
                    onClick={() => setSelectedRole("local")}
                  >
                    <div className="role-icon">
                      <MapPin size={28} />
                    </div>
                    <h3>{t("signup.buddy")}</h3>
                    <p>{t("signup.buddyText")}</p>
                  </button>
                </div>

                {error && <p className="signup-error-text">{error}</p>}

                <button
                  type="button"
                  className="signup-primary-btn full-width"
                  onClick={handleNext}
                >
                  {t("common.continue")} <ChevronRight size={18} />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="signup-step-content">
                <div className="form-group">
                  <label htmlFor="fullName">{t("common.fullName")}</label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder={t("signup.fullNamePlaceholder")}
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">{t("common.email")}</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={t("signup.emailPlaceholder")}
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">{t("common.password")}</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder={t("signup.passwordPlaceholder")}
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">{t("common.confirmPassword")}</label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder={t("signup.confirmPasswordPlaceholder")}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="gender">{t("common.gender")}</label>
                  <select
                    id="gender"
                    className="signup-select"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="">{t("signup.selectGender")}</option>
                    <option value="female">{t("common.female")}</option>
                    <option value="male">{t("common.male")}</option>
                    <option value="other">{t("common.other")}</option>
                  </select>
                  <small>{t("signup.genderHelp")}</small>
                </div>

                {selectedRole === "international" && (
                  <div className="form-group">
                    <label htmlFor="genderPreference">{t("signup.buddyGenderPreference")}</label>
                    <select
                      id="genderPreference"
                      className="signup-select"
                      name="genderPreference"
                      value={formData.genderPreference}
                      onChange={handleChange}
                    >
                      <option value="no_preference">{t("common.noPreference")}</option>
                      <option value="female">{t("common.female")}</option>
                      <option value="male">{t("common.male")}</option>
                      <option value="other">{t("common.other")}</option>
                    </select>
                    <small>{t("signup.buddyGenderHelp")}</small>
                  </div>
                )}

                {error && <p className="signup-error-text">{error}</p>}

                <div className="signup-buttons-row">
                  <button
                    type="button"
                    className="signup-secondary-btn"
                    onClick={() => setStep(1)}
                  >
                    <ChevronLeft size={18} />
                    {t("common.back")}
                  </button>

                  <button
                    type="button"
                    className="signup-primary-btn"
                    onClick={handleNext}
                  >
                    {t("common.continue")} <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="signup-step-content">
                <div className="form-group">
                  <label htmlFor="homeCountry">{t("common.homeCountry")}</label>
                  <input
                    id="homeCountry"
                    name="homeCountry"
                    type="text"
                    placeholder={t("signup.homeCountryPlaceholder")}
                    value={formData.homeCountry}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="city">{t("common.city")}</label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    placeholder={t("signup.cityPlaceholder")}
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="studyProgram">{t("common.studyProgram")}</label>
                  <input
                    id="studyProgram"
                    name="studyProgram"
                    type="text"
                    placeholder={t("signup.studyProgramPlaceholder")}
                    value={formData.studyProgram}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="languages">{t("common.languages")}</label>
                  <input
                    id="languages"
                    name="languages"
                    type="text"
                    placeholder={t("signup.languagesPlaceholder")}
                    value={formData.languages}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="hobbies">{t("common.interests")}</label>
                  <input
                    id="hobbies"
                    name="hobbies"
                    type="text"
                    placeholder={t("signup.interestsPlaceholder")}
                    value={formData.hobbies}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="aboutYou">{t("common.aboutYou")}</label>
                  <textarea
                    id="aboutYou"
                    name="aboutYou"
                    rows="4"
                    placeholder={t("signup.aboutYouPlaceholder")}
                    value={formData.aboutYou}
                    onChange={handleChange}
                  />
                </div>

                {selectedRole === "local" && (
                  <div className="form-group">
                    <label htmlFor="maxBuddies">{t("signup.maxBuddies") || "Maximum buddies"}</label>
                    <select
                      id="maxBuddies"
                      className="signup-select"
                      name="maxBuddies"
                      value={formData.maxBuddies}
                      onChange={handleChange}
                    >
                      <option value="1">1 student</option>
                      <option value="2">2 students</option>
                      <option value="3">3 students</option>
                    </select>
                    <small>{t("signup.maxBuddiesHelp") || "You can change this later in your profile."}</small>
                  </div>
                )}

                {error && <p className="signup-error-text">{error}</p>}

                <div className="signup-buttons-row">
                  <button
                    type="button"
                    className="signup-secondary-btn"
                    onClick={() => setStep(2)}
                  >
                    <ChevronLeft size={18} />
                    {t("common.back")}
                  </button>

                  <button type="submit" className="signup-primary-btn" disabled={isLoading}>
                    {isLoading ? t("signup.sendingCode") : t("signup.createAccount")}
                  </button>
                </div>
              </div>
            )}
          </form>

          <p className="signup-footer-text">
            {t("signup.alreadyHaveAccount")} <Link to="/login">{t("common.logIn")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
