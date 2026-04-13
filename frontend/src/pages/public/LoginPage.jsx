import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import "../../styles/login.css";
import { useAuth } from "../../context/AuthContext";
import { isValidEmail } from "../../utils/email";
import { useI18n } from "../../context/I18nContext";
import LanguageSwitcher from "../../components/common/LanguageSwitcher";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, isAuthenticated } = useAuth();
  const { t } = useI18n();

  const [email, setEmail] = useState(location.state?.registeredEmail || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState(
    location.state?.successMessage || ""
  );

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    if (user.role === "international") {
      navigate("/student/overview", { replace: true });
    } else if (user.role === "local") {
      navigate("/buddy/overview", { replace: true });
    } else {
      navigate("/admin", { replace: true });
    }
  }, [isAuthenticated, navigate, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");

    if (!email.trim() || !password) {
      setError(t("login.errors.missing"));
      return;
    }

    if (!isValidEmail(email)) {
      setError(t("login.errors.invalidEmail"));
      return;
    }

    setIsLoading(true);

    try {
      const loggedInUser = await login(email, password);

      if (loggedInUser.role === "international") {
        navigate("/student/overview", { replace: true });
      } else if (loggedInUser.role === "local") {
        navigate("/buddy/overview", { replace: true });
      } else {
        navigate("/admin", { replace: true });
      }
    } catch (submitError) {
      if (submitError.data?.requiresEmailVerification && submitError.data?.email) {
        navigate("/verify-email", {
          state: {
            pendingUser: {
              email: submitError.data.email,
            },
          },
        });
        return;
      }

      setError(submitError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-wrapper">
        <LanguageSwitcher className="auth-language-switcher" />
        <Link to="/" className="login-brand">
          <div className="login-brand-icon">
            <Users size={22} />
          </div>
          <h1>KazakhBuddy</h1>
        </Link>

        <div className="login-card">
          <h2>{t("login.title")}</h2>
          <p className="login-subtitle">{t("login.subtitle")}</p>

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
              <label htmlFor="password">{t("common.password")}</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("login.passwordPlaceholder")}
              />
            </div>

            <div style={{ textAlign: "right", marginTop: "-8px", marginBottom: "12px" }}>
              <Link to="/forgot-password">{t("login.forgotPassword")}</Link>
            </div>

            {infoMessage && <p style={{ color: "#0f766e", margin: 0 }}>{infoMessage}</p>}
            {error && <p style={{ color: "#dc2626", margin: 0 }}>{error}</p>}

            <button type="submit" className="login-button" disabled={isLoading}>
              <span>{isLoading ? t("login.signingIn") : t("login.title")}</span>
            </button>
          </form>

          <p className="login-footer-text">
            {t("login.noAccount")} <Link to="/signup">{t("login.createOne")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
