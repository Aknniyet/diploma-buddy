import { useState } from "react";
import { Menu, X } from "lucide-react";
import "../../styles/navbar.css";
import { NavLink } from "react-router-dom";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="navbar">
      <div className="container navbar-content">
        <NavLink to="/" className="logo" onClick={closeMenu}>
          KazakhBuddy
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
              Home
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
              onClick={closeMenu}
            >
              About
            </NavLink>

            <NavLink
              to="/guide"
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
              onClick={closeMenu}
            >
              Adaptation Guide
            </NavLink>
          </nav>

          <div className="nav-actions">
            <NavLink to="/login" className="login" onClick={closeMenu}>
              Log in
            </NavLink>

            <NavLink to="/signup" className="signup-btn" onClick={closeMenu}>
              Sign up
            </NavLink>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
