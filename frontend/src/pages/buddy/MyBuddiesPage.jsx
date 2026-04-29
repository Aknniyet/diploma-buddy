import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, Users } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { apiRequest } from "../../lib/api";
import "../../styles/buddy-my-buddies.css";

function MyBuddiesPage() {
  const [students, setStudents] = useState([]);
  const [feedbackSummary, setFeedbackSummary] = useState({
    average_rating: 0,
    feedback_count: 0,
    recent_reviews: [],
  });

  useEffect(() => {
    Promise.all([
      apiRequest("/buddy/matches/my"),
      apiRequest("/buddy/feedback/my-summary"),
    ])
      .then(([matches, feedback]) => {
        setStudents(matches);
        setFeedbackSummary(feedback);
      })
      .catch(() => null);
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

        <div className="my-buddies-feedback-card">
          <div className="my-buddies-feedback-top">
            <div>
              <h3>Buddy Feedback</h3>
              <p>See how students rate your support and communication.</p>
            </div>

            <div className="my-buddies-feedback-score">
              <div className="my-buddies-feedback-score-icon">
                <Star size={18} fill="currentColor" />
              </div>
              <div>
                <strong>
                  {feedbackSummary.feedback_count > 0 ? feedbackSummary.average_rating.toFixed(1) : "New"}
                </strong>
                <span>
                  {feedbackSummary.feedback_count > 0
                    ? `${feedbackSummary.feedback_count} review${feedbackSummary.feedback_count > 1 ? "s" : ""}`
                    : "No reviews yet"}
                </span>
              </div>
            </div>
          </div>

          {feedbackSummary.recent_reviews?.length > 0 ? (
            <div className="my-buddies-feedback-list">
              {feedbackSummary.recent_reviews.map((review) => (
                <article key={review.id} className="my-buddies-feedback-item">
                  <div className="my-buddies-feedback-user">
                    <img
                      src={review.student_photo_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                      alt={review.student_name}
                    />
                    <div>
                      <h4>{review.student_name}</h4>
                      <p>
                        {review.student_home_country || "International Student"}
                        {review.student_program ? ` · ${review.student_program}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="my-buddies-feedback-rating">
                    <Star size={14} fill="currentColor" />
                    <span>{review.rating}/5</span>
                  </div>

                  <p className="my-buddies-feedback-comment">{review.comment}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="my-buddies-feedback-empty">
              <p>Your ratings and reviews will appear here after students leave feedback.</p>
            </div>
          )}
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
