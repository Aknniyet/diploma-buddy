import { useMemo, useState } from "react";
import { X } from "lucide-react";

const supportTopicOptions = [
  "Documents",
  "Housing",
  "Transport",
  "Banking",
  "University",
  "Personal",
];

function BuddyRequestModal({ buddy, isOpen, isSubmitting = false, onClose, onSend }) {
  const [message, setMessage] = useState("");
  const [supportTopics, setSupportTopics] = useState([]);

  const isMessageValid = useMemo(() => {
    return message.trim().length > 0;
  }, [message]);

  if (!isOpen || !buddy) return null;

  const handleClose = () => {
    if (isSubmitting) return;
    setMessage("");
    setSupportTopics([]);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isMessageValid || isSubmitting) return;

    try {
      await onSend({
        buddyId: buddy.id,
        message: message.trim(),
        supportTopics,
      });
      setMessage("");
      setSupportTopics([]);
    } catch {
      // Keep the entered message so the student can retry without retyping.
    }
  };

  return (
    <div className="buddy-modal-overlay" onClick={handleClose}>
      <div
        className="buddy-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="buddy-modal-close"
          onClick={handleClose}
          disabled={isSubmitting}
        >
          <X size={24} />
        </button>

        <h2>Send Buddy Request</h2>
        <p className="buddy-modal-subtitle">
          Write a message to {buddy.name} introducing yourself
        </p>

        <div className="buddy-modal-user">
          <img
            src={buddy.avatar}
            alt={buddy.name}
            className="buddy-modal-avatar"
          />

          <div>
            <h3>{buddy.name}</h3>
            <p>{buddy.program}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="buddy-modal-label">What do you need help with?</label>
          <div className="buddy-support-topics">
            {supportTopicOptions.map((topic) => {
              const isSelected = supportTopics.includes(topic);

              return (
                <button
                  key={topic}
                  type="button"
                  className={isSelected ? "buddy-support-chip active" : "buddy-support-chip"}
                  disabled={isSubmitting}
                  onClick={() =>
                    setSupportTopics((prev) =>
                      prev.includes(topic)
                        ? prev.filter((item) => item !== topic)
                        : [...prev, topic]
                    )
                  }
                >
                  {topic}
                </button>
              );
            })}
          </div>

          <label className="buddy-modal-label">Your Message</label>

          <textarea
            className="buddy-modal-textarea"
            rows="4"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isSubmitting}
            placeholder="Hi! I'm from [country] and I'm studying [program]. I noticed we both enjoy [hobby]..."
          />

          {isSubmitting ? (
            <p className="buddy-modal-status">
              <span className="buddy-modal-status-spinner" />
              Sending your request...
            </p>
          ) : (
            <p className="buddy-modal-status buddy-modal-status-hint">
              Your message will be sent together with the selected support topics.
            </p>
          )}

          <button
            type="submit"
            className="buddy-modal-submit"
            disabled={!isMessageValid || isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send Request"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default BuddyRequestModal;
