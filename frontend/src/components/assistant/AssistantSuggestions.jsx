import { Trash2 } from "lucide-react";

function AssistantSuggestions({
  starterQuestions,
  isSending,
  onSendQuestion,
  onOpenClearModal,
}) {
  return (
    <aside className="assistant-suggestions">
      <h3>Try asking</h3>
      <div className="assistant-starter-list">
        {starterQuestions.map((question) => (
          <button
            key={question}
            type="button"
            onClick={() => onSendQuestion(question)}
            disabled={isSending}
          >
            {question}
          </button>
        ))}
      </div>

      <div className="assistant-sidebar-divider" />

      <button
        type="button"
        className="assistant-clear-chat-button"
        onClick={onOpenClearModal}
      >
        <Trash2 size={16} />
        <span>Clear Chat</span>
      </button>
    </aside>
  );
}

export default AssistantSuggestions;
