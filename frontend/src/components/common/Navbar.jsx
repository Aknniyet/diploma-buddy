import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import "../../styles/navbar.css";
import logo from "../../assets/kazakhbuddy-logo.png";
import { useI18n } from "../../context/I18nContext";
import LanguageSwitcher from "./LanguageSwitcher";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useI18n();

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="navbar">
      <div className="container navbar-content">
        <NavLink
          to="/"
          className="logo"
          aria-label={`${t("common.brand")} home`}
          onClick={closeMenu}
        >
          <img src={logo} alt="KazakhBuddy logo" className="logo-mark" />
          <span className="logo-text">
            <span className="logo-text-primary">Kazakh</span>
            <span className="logo-text-accent">Buddy</span>
          </span>
        </NavLink>

        <button
          type="button"
          className="nav-toggle"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <div className={`nav-panel ${isMenuOpen ? "open" : ""}`}>
          <nav className="nav-links">
            <NavLink
              to="/"
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
              onClick={closeMenu}
            >
              {t("nav.home")}
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
              onClick={closeMenu}
            >
              {t("nav.about")}
            </NavLink>

            <NavLink
              to="/guide"
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
              onClick={closeMenu}
            >
              {t("nav.guide")}
            </NavLink>
          </nav>

          <div className="nav-actions">
            <LanguageSwitcher />

            <NavLink to="/login" className="login" onClick={closeMenu}>
              {t("common.logIn")}
            </NavLink>

            <NavLink to="/signup" className="signup-btn" onClick={closeMenu}>
              {t("common.signUp")}
            </NavLink>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
