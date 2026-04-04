import { Send } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { getSavedUser } from "../../lib/api";

function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ChatWindow({ conversation, messages, onSendMessage }) {
  const [text, setText] = useState("");
  const canSend = useMemo(() => text.trim().length > 0, [text]);
  const messagesEndRef = useRef(null);
  const currentUser = getSavedUser();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
          <img
            src={conversation.avatar}
            alt={conversation.name}
            className="chat-user-avatar"
          />
          <div>
            <h3>{conversation.name}</h3>
            <p>{conversation.role}</p>
          </div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((message) => {
          const isMyMessage =
            message.sender === "me" ||
            message.senderId === currentUser?.id ||
            message.sender_id === currentUser?.id;

          return (
            <div
              key={message.id}
              className={
                isMyMessage
                  ? "chat-message-row my-message"
                  : "chat-message-row buddy-message"
              }
            >
              <div className="chat-bubble">
                <p>{message.text}</p>
                <span>{formatMessageTime(message.createdAt || message.created_at)}</span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-area" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="submit"
          className={canSend ? "send-button active" : "send-button"}
          disabled={!canSend}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}

export default ChatWindow;
