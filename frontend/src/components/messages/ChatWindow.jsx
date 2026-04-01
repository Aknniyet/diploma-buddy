import { Send } from "lucide-react";
import { useMemo, useState } from "react";

function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ChatWindow({ conversation, messages, onSendMessage }) {
  const [text, setText] = useState("");
  const canSend = useMemo(() => text.trim().length > 0, [text]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSend) return;
    await onSendMessage(text.trim());
    setText("");
  };

  return (
    <div className="chat-window-card">
      <div className="chat-header">
        <div className="chat-user">
          <img src={conversation.avatar} alt={conversation.name} className="chat-user-avatar" />
          <div>
            <h3>{conversation.name}</h3>
            <p>{conversation.role}</p>
          </div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={message.sender === "me" ? "chat-message-row my-message" : "chat-message-row buddy-message"}>
            <div className="chat-bubble">
              <p>{message.text}</p>
              <span>{formatMessageTime(message.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>

      <form className="chat-input-area" onSubmit={handleSubmit}>
        <input type="text" placeholder="Type a message..." value={text} onChange={(e) => setText(e.target.value)} />
        <button type="submit" className={canSend ? "send-button active" : "send-button"} disabled={!canSend}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}

export default ChatWindow;
