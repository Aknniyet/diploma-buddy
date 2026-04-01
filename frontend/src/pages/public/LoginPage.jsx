import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn, Users } from "lucide-react";
import "../../styles/login.css";
import { useAuth } from "../../context/AuthContext";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, isAuthenticated } = useAuth();
  const [email, setEmail] = useState(location.state?.registeredEmail || "");
  const [password, setPassword] = useState(location.state?.registeredPassword || "");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState(
    location.state?.registeredEmail ? "Account created successfully. Please sign in." : ""
  );

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    if (user.role === "international") navigate("/student/overview", { replace: true });
    else if (user.role === "local") navigate("/buddy/overview", { replace: true });
    else navigate("/admin", { replace: true });
  }, [isAuthenticated, navigate, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");
    setIsLoading(true);

    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser.role === "international") navigate("/student/overview", { replace: true });
      else if (loggedInUser.role === "local") navigate("/buddy/overview", { replace: true });
      else navigate("/admin", { replace: true });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-wrapper">
        <Link to="/" className="login-brand">
          <div className="login-brand-icon"><Users size={22} /></div>
          <h1>KazakhBuddy</h1>
        </Link>
        <div className="login-card">
          <h2>Sign In</h2>
          <p className="login-subtitle">Use your registered email and password</p>
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {infoMessage && <p style={{ color: "#0f766e", margin: 0 }}>{infoMessage}</p>}
            {error && <p style={{ color: "#dc2626", margin: 0 }}>{error}</p>}
            <button type="submit" className="login-button" disabled={isLoading}>
              <span>{isLoading ? "Signing in..." : "Sign In"}</span>
            </button>
          </form>
          <p className="login-footer-text">Don't have an account? <Link to="/signup">Create one</Link></p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
