import { Trash2 } from "lucide-react";
import "../../styles/assistant.css";

function AssistantConfirmModal({
  title = "Clear conversation?",
  description = "Are you sure you want to clear this conversation?",
  confirmLabel = "Clear",
  isLoading = false,
  onCancel,
  onConfirm,
}) {
  return (
    <div className="assistant-modal-backdrop" role="presentation">
      <div
        className="assistant-confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="assistant-clear-title"
      >
        <div className="assistant-confirm-icon">
          <Trash2 size={20} />
        </div>
        <div>
          <h2 id="assistant-clear-title">{title}</h2>
          <p>{description}</p>
        </div>
        <div className="assistant-confirm-actions">
          <button
            type="button"
            className="assistant-confirm-cancel"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="assistant-confirm-clear"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Clearing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AssistantConfirmModal;
