import { useMemo, useState } from "react";
import { X } from "lucide-react";

function BuddyRequestModal({ buddy, isOpen, onClose, onSend }) {
  const [message, setMessage] = useState("");

  const isMessageValid = useMemo(() => {
    return message.trim().length > 0;
  }, [message]);

  if (!isOpen || !buddy) return null;

  const handleClose = () => {
    setMessage("");
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isMessageValid) return;

    onSend({
      buddyId: buddy.id,
      message: message.trim(),
    });

    setMessage("");
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
          <label className="buddy-modal-label">Your Message</label>

          <textarea
            className="buddy-modal-textarea"
            rows="4"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Hi! I'm from [country] and I'm studying [program]. I noticed we both enjoy [hobby]..."
          />

          <button
            type="submit"
            className="buddy-modal-submit"
            disabled={!isMessageValid}
          >
            Send Request
          </button>
        </form>
      </div>
    </div>
  );
}

export default BuddyRequestModal;