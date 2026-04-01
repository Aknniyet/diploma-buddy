import { Globe, BookOpen, Clock3, Check, X } from "lucide-react";

function RequestCard({ request, onAccept, onDecline, isPast = false }) {
  return (
    <div className="buddy-request-item">
      <div className="buddy-request-main">
        <img
          src={request.avatar}
          alt={request.name}
          className="buddy-request-avatar"
        />

        <div className="buddy-request-content">
          <div className="buddy-request-top">
            <h3>{request.name}</h3>

            <div className="buddy-request-meta">
              <span>
                <Globe size={14} />
                {request.country}
              </span>

              <span>
                <BookOpen size={14} />
                {request.program}
              </span>
            </div>
          </div>

          <div className="buddy-request-tags">
            {request.interests.map((tag) => (
              <span key={tag} className="buddy-request-tag">
                {tag}
              </span>
            ))}
          </div>

          <div className="buddy-request-message">{request.message}</div>

          <div className="buddy-request-footer">
            <div className="buddy-request-date">
              <Clock3 size={14} />
              <span>{request.date}</span>
            </div>

            {isPast ? (
              <div
                className={
                  request.status === "accepted"
                    ? "request-status-badge accepted"
                    : "request-status-badge declined"
                }
              >
                {request.status === "accepted" ? (
                  <>
                    <Check size={14} />
                    <span>Accepted</span>
                  </>
                ) : (
                  <>
                    <X size={14} />
                    <span>Declined</span>
                  </>
                )}
              </div>
            ) : (
              <div className="buddy-request-actions">
                <button
                  type="button"
                  className="decline-btn"
                  onClick={() => onDecline(request.id)}
                >
                  <X size={16} />
                  <span>Decline</span>
                </button>

                <button
                  type="button"
                  className="accept-btn"
                  onClick={() => onAccept(request.id)}
                >
                  <Check size={16} />
                  <span>Accept</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RequestCard;