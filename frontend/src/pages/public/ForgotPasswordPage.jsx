import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../../lib/api";
import "../../styles/login.css";
import { isValidEmail } from "../../utils/email";
import { useI18n } from "../../context/I18nContext";
import LanguageSwitcher from "../../components/common/LanguageSwitcher";

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { t } = useI18n();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError(t("forgotPassword.errors.missing"));
      return;
    }

    if (!isValidEmail(email)) {
      setError(t("forgotPassword.errors.invalidEmail"));
      return;
    }

    setIsLoading(true);

    try {
      await apiRequest("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      navigate("/reset-password", {
        state: { email },
      });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-wrapper">
        <LanguageSwitcher className="auth-language-switcher" />
        <div className="login-card">
          <h2>{t("forgotPassword.title")}</h2>
          <p className="login-subtitle">{t("forgotPassword.subtitle")}</p>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">{t("common.email")}</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("login.emailPlaceholder")}
              />
            </div>

            {error && <p style={{ color: "#dc2626", margin: 0 }}>{error}</p>}

            <button type="submit" className="login-button" disabled={isLoading}>
              <span>{isLoading ? t("common.sending") : t("forgotPassword.sendCode")}</span>
            </button>
          </form>

          <p className="login-footer-text">
            {t("forgotPassword.backToLogin")} <Link to="/login">{t("login.title")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
