import { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Globe,
  MapPin,
  MessageSquare,
  CheckCircle2,
  Star,
  Clock3,
} from "lucide-react";

function BuddyCard({ buddy, onConnect, onLeaveFeedback, onRequestReassignment }) {
  const [isScoreOpen, setIsScoreOpen] = useState(false);
  const status = buddy.status;
  const matchedNlpTopics = buddy.nlpInsights?.matchedTopics || [];
  const detectedNlpTopics = buddy.nlpInsights?.detectedTopics || [];
  const nlpTopics =
    matchedNlpTopics.length > 0 ? matchedNlpTopics : detectedNlpTopics;
  const nlpTopicLabel =
    matchedNlpTopics.length > 0 ? "NLP support match" : "Detected student needs";
  const isDisabled =
    status === "pending" ||
    status === "declined" ||
    status === "matched" ||
    status === "locked" ||
    status === "waiting" ||
    buddy.spotsAvailable === 0;
  const isAvailable = !isDisabled;
  const meetingMode = buddy.preferredMeetingMode
    ? buddy.preferredMeetingMode.charAt(0).toUpperCase() + buddy.preferredMeetingMode.slice(1)
    : "Both";

  const buttonLabel =
    status === "matched"
      ? "Your Buddy"
      : status === "declined"
      ? "Declined"
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
        <div className="buddy-detail-row"><Clock3 size={14} /><span>{meetingMode} | {buddy.maxWeeklyHours || 2}h/week</span></div>
      </div>

      <div className="buddy-rating-row">
        <div className="buddy-rating-badge">
          <Star size={14} fill="currentColor" />
          <span>{buddy.averageRating ? buddy.averageRating.toFixed(1) : "New"}</span>
        </div>
        <small>
          {buddy.feedbackCount > 0 ? `${buddy.feedbackCount} review${buddy.feedbackCount > 1 ? "s" : ""}` : "No reviews yet"}
        </small>
      </div>

      <p className="buddy-card-bio">{buddy.bio}</p>

      <div className="buddy-score-panel">
        <button
          type="button"
          className="buddy-score-toggle"
          onClick={() => setIsScoreOpen((prev) => !prev)}
          aria-expanded={isScoreOpen}
        >
          <strong>Compatibility {buddy.scoreLabel || `${buddy.score}/100`}</strong>
          <span>
            Why this buddy fits
            {isScoreOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </button>

        {!isScoreOpen && buddy.matchReasons?.length ? (
          <div className="buddy-score-preview">
            {buddy.matchReasons.slice(0, 2).map((reason) => (
              <span key={reason} className="buddy-reason-pill compact">
                {reason}
              </span>
            ))}
          </div>
        ) : null}

        {isScoreOpen ? (
          <div className="buddy-score-content">
            {nlpTopics.length > 0 ? (
              <div className="buddy-nlp-insight">
                <p>{nlpTopicLabel}</p>
                <div className="buddy-reason-list">
                  {nlpTopics.map((topic) => (
                    <span key={topic} className="buddy-reason-pill">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {buddy.matchReasons?.length ? (
              <div className="buddy-reason-list">
                {buddy.matchReasons.map((reason) => (
                  <span key={reason} className="buddy-reason-pill">
                    {reason}
                  </span>
                ))}
              </div>
            ) : null}

            {buddy.matchBreakdown?.length ? (
              <div className="buddy-breakdown-list">
                {buddy.matchBreakdown.map((item) => (
                  <div className="buddy-breakdown-row" key={item.key}>
                    <div>
                      <p>{item.label}</p>
                      <small>{item.summary}</small>
                    </div>
                    <strong>+{item.score}</strong>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="buddy-tags">
        {(buddy.interests || []).map((tag) => <span key={tag} className="buddy-tag">{tag}</span>)}
        {(buddy.supportAreas || []).map((tag) => <span key={`support-${tag}`} className="buddy-tag support">{tag}</span>)}
      </div>

      <div className="buddy-card-footer">
        <div>
          <p>{buddy.spotsAvailable} spots available</p>
          <small>
            {status === "matched"
              ? "You are currently matched with this buddy"
              : status === "locked"
              ? "You already have an active buddy"
              : status === "declined"
              ? "This buddy already declined your request."
              : status === "waiting"
              ? "You already have a pending request."
              : `Matching score: ${buddy.scoreLabel || `${buddy.score}/100`}`}
          </small>
        </div>
        <div className="buddy-card-actions">
          <button
            type="button"
            className={`connect-btn ${isAvailable ? "connect-btn-primary" : "connected-btn"}`}
            onClick={() => onConnect(buddy)}
            disabled={isDisabled}
          >
            {status === "matched" ? <CheckCircle2 size={16} /> : <MessageSquare size={16} />}
            <span>{buttonLabel}</span>
          </button>

          {status === "matched" ? (
            <>
              <button type="button" className="feedback-btn" onClick={() => onLeaveFeedback?.(buddy)}>
                <Star size={16} />
                <span>{buddy.currentUserRating ? "Edit Feedback" : "Leave Feedback"}</span>
              </button>
              {buddy.hasPendingReassignment ? (
                <div className="feedback-btn feedback-btn-status">
                  <CheckCircle2 size={16} />
                  <span>Request Sent</span>
                </div>
              ) : (
                <button type="button" className="feedback-btn" onClick={() => onRequestReassignment?.(buddy)} disabled={!buddy.matchId}>
                  <MessageSquare size={16} />
                  <span>Request Reassignment</span>
                </button>
              )}
            </>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default BuddyCard;
