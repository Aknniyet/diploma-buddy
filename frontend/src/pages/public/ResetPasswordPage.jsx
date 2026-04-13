import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiRequest } from "../../lib/api";
import "../../styles/login.css";
import { isValidEmail } from "../../utils/email";
import { useI18n } from "../../context/I18nContext";
import LanguageSwitcher from "../../components/common/LanguageSwitcher";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useI18n();

  const [email, setEmail] = useState(location.state?.email || "");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !code.trim() || !newPassword || !confirmPassword) {
      setError(t("resetPassword.errors.missing"));
      return;
    }

    if (!isValidEmail(email)) {
      setError(t("resetPassword.errors.invalidEmail"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t("resetPassword.errors.passwordsMismatch"));
      return;
    }

    setIsLoading(true);

    try {
      await apiRequest("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          email,
          code,
          newPassword,
          confirmPassword,
        }),
      });

      navigate("/login", {
        replace: true,
        state: {
          successMessage: {
            en: "Password reset successful. Please sign in.",
            ru: "Пароль успешно изменён. Теперь войдите.",
            kz: "Құпиясөз сәтті өзгертілді. Енді кіріңіз.",
          }[language],
          registeredEmail: email,
        },
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
          <h2>{t("resetPassword.title")}</h2>
          <p className="login-subtitle">{t("resetPassword.subtitle")}</p>

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

            <div className="form-group">
              <label htmlFor="code">{t("resetPassword.code")}</label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={t("resetPassword.codePlaceholder")}
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">{t("resetPassword.newPassword")}</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">{t("common.confirmPassword")}</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {error && <p style={{ color: "#dc2626", margin: 0 }}>{error}</p>}

            <button type="submit" className="login-button" disabled={isLoading}>
              <span>{isLoading ? t("resetPassword.resetting") : t("resetPassword.resetButton")}</span>
            </button>
          </form>

          <p className="login-footer-text">
            {t("resetPassword.backToLogin")} <Link to="/login">{t("login.title")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
