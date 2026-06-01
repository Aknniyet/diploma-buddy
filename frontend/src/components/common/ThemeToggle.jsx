import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

function ThemeToggle({ compact = false }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className={`theme-toggle-shell ${compact ? "compact" : ""}`}>
      <button
        type="button"
        className={`theme-toggle ${isDark ? "active-dark" : "active-light"} ${compact ? "compact" : ""}`}
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        <span className="theme-toggle-icon">
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </span>
        <span>{isDark ? "Dark" : "Light"}</span>
      </button>
    </div>
  );
}

export default ThemeToggle;
