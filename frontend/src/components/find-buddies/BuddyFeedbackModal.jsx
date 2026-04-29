import { useEffect, useState } from "react";
import { Star, X } from "lucide-react";

function BuddyFeedbackModal({ buddy, isOpen, onClose, onSave }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (!buddy || !isOpen) return;
    setRating(buddy.currentUserRating || 0);
    setComment(buddy.currentUserComment || "");
  }, [buddy, isOpen]);

  if (!isOpen || !buddy) return null;

  const isValid = rating >= 1 && comment.trim().length >= 4;

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!isValid) return;

    onSave({
      buddyId: buddy.id,
      rating,
      comment: comment.trim(),
    });
  };

  return (
    <div className="buddy-modal-overlay" onClick={handleClose}>
      <div className="buddy-modal feedback-modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="buddy-modal-close" onClick={handleClose}>
          <X size={24} />
        </button>

        <h2>{buddy.currentUserRating ? "Edit Feedback" : "Leave Feedback"}</h2>
        <p className="buddy-modal-subtitle">
          Share your experience with {buddy.name}. This helps improve the quality of buddy support.
        </p>

        <div className="buddy-modal-user">
          <img src={buddy.avatar} alt={buddy.name} className="buddy-modal-avatar" />
          <div>
            <h3>{buddy.name}</h3>
            <p>{buddy.program}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="buddy-modal-label">Your Rating</label>
          <div className="feedback-stars">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className={`feedback-star-button ${value <= rating ? "active" : ""}`}
                onClick={() => setRating(value)}
              >
                <Star size={22} fill={value <= rating ? "currentColor" : "none"} />
              </button>
            ))}
          </div>

          <label className="buddy-modal-label">Your Comment</label>
          <textarea
            className="buddy-modal-textarea"
            rows="5"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="For example: My buddy was very helpful with documents, transport, and settling in."
          />

          <button type="submit" className="buddy-modal-submit" disabled={!isValid}>
            Save Feedback
          </button>
        </form>
      </div>
    </div>
  );
}

export default BuddyFeedbackModal;
