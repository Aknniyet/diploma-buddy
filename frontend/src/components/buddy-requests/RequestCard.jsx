import { Globe, BookOpen, Clock3, Check, X } from "lucide-react";

function RequestCard({
  request,
  onAccept,
  onDecline,
  isPast = false,
  isResponding = false,
  respondingAction = "",
}) {
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

          {request.supportTopics?.length ? (
            <div className="buddy-request-support">
              <strong>Needs help with</strong>
              <div className="buddy-request-support-tags">
                {request.supportTopics.map((topic) => (
                  <span key={topic} className="buddy-request-support-tag">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

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
                  disabled={isResponding}
                  onClick={() => onDecline(request.id)}
                >
                  <X size={16} />
                  <span>{isResponding && respondingAction === "decline" ? "Declining..." : "Decline"}</span>
                </button>

                <button
                  type="button"
                  className="accept-btn"
                  disabled={isResponding}
                  onClick={() => onAccept(request.id)}
                >
                  <Check size={16} />
                  <span>{isResponding && respondingAction === "accept" ? "Accepting..." : "Accept"}</span>
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
