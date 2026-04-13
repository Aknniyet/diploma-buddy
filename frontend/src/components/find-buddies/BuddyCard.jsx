import { BookOpen, Globe, MapPin, MessageSquare, CheckCircle2 } from "lucide-react";

function BuddyCard({ buddy, onConnect }) {
  const status = buddy.status;
  const isDisabled = status === "pending" || status === "matched" || buddy.spotsAvailable === 0;

  const buttonLabel =
    status === "matched"
      ? "Matched"
      : status === "pending"
      ? "Pending"
      : buddy.spotsAvailable === 0
      ? "Full"
      : "Connect";

  return (
    <article className="buddy-card">
      <div className="buddy-card-header">
        <img src={buddy.avatar} alt={buddy.name} className="buddy-card-avatar" />
        <div className="buddy-card-user-info">
          <h3>{buddy.name}</h3>
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
          <small>Matching score: {buddy.score}</small>
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
