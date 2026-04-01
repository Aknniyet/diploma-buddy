import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardTopbar from "../components/dashboard/DashboardTopbar";
import "../styles/dashboard.css";

function DashboardLayout({ children, title, sidebarType = "student" }) {
  return (
    <div className="dashboard-layout">
      <DashboardSidebar sidebarType={sidebarType} />

      <div className="dashboard-main">
        <DashboardTopbar title={title} sidebarType={sidebarType} />
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;