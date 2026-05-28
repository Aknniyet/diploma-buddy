import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiRequest } from "../../lib/api";
import "../../styles/login.css";
import { isValidEmail } from "../../utils/email";
import { useI18n } from "../../context/I18nContext";
import LanguageSwitcher from "../../components/common/LanguageSwitcher";

function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useI18n();
  const pendingUser = location.state?.pendingUser;
  const isRegistrationFlow = Boolean(
    pendingUser?.fullName &&
      pendingUser?.password &&
      pendingUser?.confirmPassword &&
      pendingUser?.role
  );

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  if (!pendingUser) {
    return (
      <div className="login-page">
        <div className="login-wrapper">
          <div className="login-card">
            <h2>{t("verifyEmail.noDataTitle")}</h2>
            <p>{t("verifyEmail.noDataText")}</p>
            <Link to="/signup">{t("verifyEmail.backToSignup")}</Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!pendingUser.email || !isValidEmail(pendingUser.email)) {
      setError(t("verifyEmail.errors.invalidRegistrationEmail"));
      return;
    }

    if (!code.trim()) {
      setError(t("verifyEmail.errors.missingCode"));
      return;
    }

    setIsLoading(true);

    try {
      await apiRequest(isRegistrationFlow ? "/auth/register/verify" : "/auth/email/verify", {
        method: "POST",
        body: JSON.stringify({
          ...(isRegistrationFlow ? pendingUser : { email: pendingUser.email }),
          code: code.trim(),
        }),
      });

      navigate("/login", {
        replace: true,
        state: {
          successMessage: {
            en: "Email verified successfully. Please sign in.",
            ru: "Почта успешно подтверждена. Теперь войдите.",
            kz: "Пошта сәтті расталды. Енді кіріңіз.",
          }[language],
          registeredEmail: pendingUser.email,
        },
      });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError("");
    setMessage("");

    if (!pendingUser.email || !isValidEmail(pendingUser.email)) {
      setError(t("verifyEmail.errors.invalidRegistrationEmail"));
      return;
    }

    setIsResending(true);

    try {
      const data = await apiRequest("/auth/register/resend-code", {
        method: "POST",
        body: JSON.stringify({ email: pendingUser.email }),
      });

      setMessage(data.message);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-wrapper">
        <LanguageSwitcher className="auth-language-switcher" />
        <div className="login-card">
          <h2>{t("verifyEmail.title")}</h2>
          <p className="login-subtitle">
            {t("verifyEmail.subtitle")} <strong>{pendingUser.email}</strong>
          </p>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="code">{t("verifyEmail.codeLabel")}</label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={t("verifyEmail.codePlaceholder")}
              />
            </div>

            {message && <p style={{ color: "#0f766e", margin: 0 }}>{message}</p>}
            {error && <p style={{ color: "#dc2626", margin: 0 }}>{error}</p>}

            <button type="submit" className="login-button" disabled={isLoading}>
              <span>{isLoading ? t("verifyEmail.verifying") : t("verifyEmail.verifyButton")}</span>
            </button>
          </form>

          <div className="login-secondary-action">
            <p>{t("verifyEmail.didntGetCode")}</p>
            <button
              type="button"
              className="login-secondary-button"
              onClick={handleResendCode}
              disabled={isResending}
            >
              <span>{isResending ? t("common.sending") : t("verifyEmail.resendCode")}</span>
            </button>
          </div>

          <p className="login-footer-text">
            {t("common.back")} <Link to="/signup">{t("common.signUp")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmailPage;
