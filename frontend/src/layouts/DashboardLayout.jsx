import { useEffect, useState } from "react";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardTopbar from "../components/dashboard/DashboardTopbar";
import "../styles/dashboard.css";

function DashboardLayout({ children, title, sidebarType = "student" }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="dashboard-layout">
      <DashboardSidebar
        sidebarType={sidebarType}
        isMobileOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      <div className="dashboard-main">
        <DashboardTopbar
          title={title}
          sidebarType={sidebarType}
          onMenuToggle={() => setIsMobileSidebarOpen((prev) => !prev)}
        />
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;
