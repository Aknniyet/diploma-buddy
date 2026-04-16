import { BookOpen, Globe, MapPin, MessageSquare, CheckCircle2 } from "lucide-react";

function BuddyCard({ buddy, onConnect }) {
  const status = buddy.status;
  const isDisabled =
    status === "pending" ||
    status === "matched" ||
    status === "locked" ||
    status === "waiting" ||
    buddy.spotsAvailable === 0;

  const buttonLabel =
    status === "matched"
      ? "Your Buddy"
      : status === "locked"
      ? "Unavailable"
      : status === "waiting"
      ? "Waiting"
      : status === "pending"
      ? "Pending"
      : buddy.spotsAvailable === 0
      ? "Full"
      : "Connect";

  return (
    <article className={`buddy-card ${status === "matched" ? "buddy-card-current" : ""}`}>
      <div className="buddy-card-header">
        <img src={buddy.avatar} alt={buddy.name} className="buddy-card-avatar" />
        <div className="buddy-card-user-info">
          <div className="buddy-card-title-row">
            <h3>{buddy.name}</h3>
            {status === "matched" ? <span className="current-buddy-badge">Your Buddy</span> : null}
          </div>
          <div className="buddy-card-location">
            <MapPin size={14} />
            <span>{buddy.city}</span>
          </div>
        </div>
      </div>

      <div className="buddy-card-details">
        <div className="buddy-detail-row"><BookOpen size={14} /><span>{buddy.program}</span></div>
        <div className="buddy-detail-row"><Globe size={14} /><span>{buddy.languages || "Not specified"}</span></div>
      </div>

      <p className="buddy-card-bio">{buddy.bio}</p>
      <div className="buddy-tags">
        {(buddy.interests || []).map((tag) => <span key={tag} className="buddy-tag">{tag}</span>)}
      </div>

      <div className="buddy-card-footer">
        <div>
          <p>{buddy.spotsAvailable} spots available</p>
          <small>
            {status === "matched"
              ? "You are currently matched with this buddy"
              : status === "locked"
              ? "You already have an active buddy"
              : status === "waiting"
              ? "You already have a pending request"
              : `Matching score: ${buddy.score}`}
          </small>
        </div>
        <button type="button" className={`connect-btn ${isDisabled ? "connected-btn" : ""}`} onClick={() => onConnect(buddy)} disabled={isDisabled}>
          {status === "matched" ? <CheckCircle2 size={16} /> : <MessageSquare size={16} />}
          <span>{buttonLabel}</span>
        </button>
      </div>
    </article>
  );
}

export default BuddyCard;
