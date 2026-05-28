import { Bot, Send, UserRound } from "lucide-react";

function AssistantChatCard({
  chat,
  isSending,
  message,
  messagesRef,
  onMessageChange,
  onSubmit,
  onNavigate,
}) {
  return (
    <div className="assistant-chat-card">
      <div className="assistant-messages" ref={messagesRef}>
        {chat.map((item) => (
          <div
            key={item.id}
            className={`assistant-message ${item.sender === "user" ? "assistant-message-user" : ""}`}
          >
            <div className="assistant-message-icon">
              {item.sender === "user" ? <UserRound size={18} /> : <Bot size={18} />}
            </div>

            <div className="assistant-message-content">
              <p>{item.text}</p>

              {item.actions.length > 0 ? (
                <div className="assistant-actions">
                  {item.actions.map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => onNavigate(action.path)}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ))}

        {isSending ? (
          <div className="assistant-message">
            <div className="assistant-message-icon">
              <Bot size={18} />
            </div>
            <div className="assistant-message-content">
              <p>Thinking...</p>
            </div>
          </div>
        ) : null}
      </div>

      <form className="assistant-input-row" onSubmit={onSubmit}>
        <input
          value={message}
          onChange={onMessageChange}
          placeholder="Ask about IIN, checklist, events, or buddy matching..."
        />
        <button type="submit" disabled={!message.trim() || isSending}>
          <Send size={18} />
          Send
        </button>
      </form>
    </div>
  );
}

export default AssistantChatCard;
