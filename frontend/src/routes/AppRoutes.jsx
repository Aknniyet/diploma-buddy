import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/public/HomePage";
import AboutPage from "../pages/public/AboutPage";
import AdaptationGuidePage from "../pages/public/AdaptationGuidePage";
import LoginPage from "../pages/public/LoginPage";
import SignupPage from "../pages/public/SignupPage";
import VerifyEmailPage from "../pages/public/VerifyEmailPage";
import ForgotPasswordPage from "../pages/public/ForgotPasswordPage";
import ResetPasswordPage from "../pages/public/ResetPasswordPage";
import MessagesPage from "../pages/shared/MessagesPage";
import NotificationsPage from "../pages/shared/NotificationsPage";
import ProfilePage from "../pages/shared/ProfilePage";
import EventsPage from "../pages/shared/EventsPage";
import StudentOverview from "../pages/student/StudentOverview";
import FindBuddiesPage from "../pages/student/FindBuddiesPage";
import AdaptationChecklistPage from "../pages/student/AdaptationChecklistPage";
import CommunityBoardPage from "../pages/student/CommunityBoardPage";
import BuddyOverviewPage from "../pages/buddy/BuddyOverviewPage";
import MyBuddiesPage from "../pages/buddy/MyBuddiesPage";
import BuddyRequestsPage from "../pages/buddy/BuddyRequestsPage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminEventsPage from "../pages/admin/AdminEventsPage";
import AdminMatchesPage from "../pages/admin/AdminMatchesPage";
import AdminBuddyProfilesPage from "../pages/admin/AdminBuddyProfilesPage";
import ProtectedRoute from "../components/auth/ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/guide" element={<AdaptationGuidePage />} />

      <Route
        path="/student/messages"
        element={
          <ProtectedRoute allowedRoles={["international"]}>
            <MessagesPage userType="student" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/buddy/messages"
        element={
          <ProtectedRoute allowedRoles={["local"]}>
            <MessagesPage userType="buddy" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/notifications"
        element={
          <ProtectedRoute allowedRoles={["international"]}>
            <NotificationsPage userType="student" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/buddy/notifications"
        element={
          <ProtectedRoute allowedRoles={["local"]}>
            <NotificationsPage userType="buddy" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/profile"
        element={
          <ProtectedRoute allowedRoles={["international"]}>
            <ProfilePage userType="student" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/buddy/profile"
        element={
          <ProtectedRoute allowedRoles={["local"]}>
            <ProfilePage userType="buddy" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/events"
        element={
          <ProtectedRoute allowedRoles={["international"]}>
            <EventsPage userType="student" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/overview"
        element={
          <ProtectedRoute allowedRoles={["international"]}>
            <StudentOverview />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/find-buddies"
        element={
          <ProtectedRoute allowedRoles={["international"]}>
            <FindBuddiesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/checklist"
        element={
          <ProtectedRoute allowedRoles={["international"]}>
            <AdaptationChecklistPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/community"
        element={
          <ProtectedRoute allowedRoles={["international"]}>
            <CommunityBoardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/buddy/events"
        element={
          <ProtectedRoute allowedRoles={["local"]}>
            <EventsPage userType="buddy" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/buddy/community"
        element={
          <ProtectedRoute allowedRoles={["local"]}>
            <CommunityBoardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/buddy/overview"
        element={
          <ProtectedRoute allowedRoles={["local"]}>
            <BuddyOverviewPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/buddy/my-buddies"
        element={
          <ProtectedRoute allowedRoles={["local"]}>
            <MyBuddiesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/buddy/buddy-requests"
        element={
          <ProtectedRoute allowedRoles={["local"]}>
            <BuddyRequestsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/matches"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminMatchesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/events"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminEventsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/buddies"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminBuddyProfilesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
