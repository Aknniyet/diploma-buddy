import { Trash2 } from "lucide-react";

function AssistantConfirmModal({ onCancel, onConfirm }) {
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
          <h2 id="assistant-clear-title">Clear conversation?</h2>
          <p>Are you sure you want to clear this conversation?</p>
        </div>
        <div className="assistant-confirm-actions">
          <button
            type="button"
            className="assistant-confirm-cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="assistant-confirm-clear"
            onClick={onConfirm}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

export default AssistantConfirmModal;
