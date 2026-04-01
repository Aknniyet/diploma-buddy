import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { apiRequest } from "../../lib/api";
import "../../styles/buddy-my-buddies.css";

function MyBuddiesPage() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    apiRequest("/buddy/matches/my").then(setStudents).catch(() => null);
  }, []);

  return (
    <DashboardLayout title="My Buddies" sidebarType="buddy">
      <section className="my-buddies-page">
        <div className="my-buddies-header">
          <h1>My Buddies</h1>
          <p>International students you are currently helping</p>
        </div>

        <div className="my-buddies-summary-card">
          <div className="my-buddies-summary-left">
            <div className="my-buddies-summary-icon"><Users size={20} /></div>
            <div>
              <h3>{students.length} Active Buddies</h3>
              <p>You can support up to 3 students</p>
            </div>
          </div>
          <div className="my-buddies-summary-badge">{students.length}/3 slots filled</div>
        </div>

        {students.length === 0 ? (
          <div className="my-buddies-empty-card">
            <div className="my-buddies-empty-content">
              <Users size={52} />
              <h3>No buddies yet</h3>
              <p>International students will appear here after you accept their requests.</p>
              <Link to="/buddy/buddy-requests" className="pending-link">Check pending requests</Link>
            </div>
          </div>
        ) : (
          <div className="buddy-requests-list">
            {students.map((student) => (
              <div key={student.id} className="buddy-request-item">
                <div className="buddy-request-main">
                  <img src={student.profile_photo_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} alt={student.full_name} className="buddy-request-avatar" />
                  <div className="buddy-request-content">
                    <div className="buddy-request-top">
                      <h3>{student.full_name}</h3>
                      <div className="buddy-request-meta">
                        <span>{student.home_country || "Country not provided"}</span>
                        <span>{student.study_program || "Program not provided"}</span>
                      </div>
                    </div>
                    <div className="buddy-request-message">{student.about_you || "This student has not added a bio yet."}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}

export default MyBuddiesPage;
