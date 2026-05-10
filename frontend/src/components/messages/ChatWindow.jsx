import { Send } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { getSavedUser } from "../../lib/api";
import { formatAstanaRelativeDateLabel, formatAstanaTime, getAstanaDateKey } from "../../utils/datetime";

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

  let lastDate = null;

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
          const rawDate = message.date || message.createdAt || message.created_at;
          const currentDate = rawDate ? getAstanaDateKey(rawDate) : null;
          const showDateDivider = currentDate && currentDate !== lastDate;
          const messageTime = rawDate ? formatAstanaTime(rawDate) : message.time;

          if (currentDate) {
            lastDate = currentDate;
          }

          const isMyMessage =
            message.sender === "me" ||
            message.senderId === currentUser?.id ||
            message.sender_id === currentUser?.id;

          return (
            <div key={message.id}>
              {showDateDivider && (
                <div className="chat-date-divider">
                  {formatAstanaRelativeDateLabel(rawDate)}
                </div>
              )}

              <div
                className={
                  isMyMessage
                    ? "chat-message-row my-message"
                    : "chat-message-row buddy-message"
                }
              >
                <div className="chat-bubble">
                  <p>{message.text}</p>
                  <span>{messageTime || message.time}</span>
                </div>
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
