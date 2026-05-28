import { Send, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import AssistantConfirmModal from "../assistant/AssistantConfirmModal";
import { getSavedUser } from "../../lib/api";
import { formatAstanaRelativeDateLabel, formatAstanaTime, getAstanaDateKey } from "../../utils/datetime";

function ChatWindow({
  conversation,
  messages,
  actionError,
  isClearingConversation,
  isDeletingMessages,
  onClearConversation,
  onDeleteMessages,
  onSendMessage,
}) {
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState([]);
  const canSend = useMemo(() => text.trim().length > 0, [text]);
  const messagesEndRef = useRef(null);
  const isSendingRef = useRef(false);
  const currentUser = getSavedUser();
  const isBusy = isSending || isDeletingMessages || isClearingConversation;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setIsSelectionMode(false);
    setSelectedMessageIds([]);
    setIsClearModalOpen(false);
  }, [conversation.id]);

  useEffect(() => {
    setSelectedMessageIds((prev) =>
      prev.filter((messageId) => messages.some((message) => message.id === messageId))
    );
  }, [messages]);

  const renderedMessages = useMemo(() => {
    let lastDateKey = null;

    return messages.map((message) => {
      const rawDate = message.date || message.createdAt || message.created_at;
      const currentDate = rawDate ? getAstanaDateKey(rawDate) : null;
      const showDateDivider = currentDate && currentDate !== lastDateKey;
      const messageTime = rawDate ? formatAstanaTime(rawDate) : message.time;

      if (currentDate) {
        lastDateKey = currentDate;
      }

      const isMyMessage =
        message.sender === "me" ||
        message.senderId === currentUser?.id ||
        message.sender_id === currentUser?.id;

      return {
        ...message,
        isSelectable: Number.isInteger(message.id) && !message.isPending,
        isSelected: selectedMessageIds.includes(message.id),
        rawDate,
        showDateDivider,
        messageTime,
        isMyMessage,
      };
    });
  }, [messages, currentUser?.id, selectedMessageIds]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const nextText = String(formData.get("messageText") ?? "").trim();

    if (!nextText || isSendingRef.current) {
      return;
    }

    isSendingRef.current = true;
    setIsSending(true);
    setText("");

    try {
      await onSendMessage(nextText);
    } catch {
      setText(nextText);
    } finally {
      isSendingRef.current = false;
      setIsSending(false);
    }
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode((currentValue) => {
      if (currentValue) {
        setSelectedMessageIds([]);
      }

      return !currentValue;
    });
  };

  const toggleMessageSelection = (messageId) => {
    setSelectedMessageIds((currentIds) =>
      currentIds.includes(messageId)
        ? currentIds.filter((id) => id !== messageId)
        : [...currentIds, messageId]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedMessageIds.length === 0) {
      return;
    }

    await onDeleteMessages(selectedMessageIds);
    setSelectedMessageIds([]);
    setIsSelectionMode(false);
  };

  const handleClearChat = async () => {
    await onClearConversation();
    setSelectedMessageIds([]);
    setIsSelectionMode(false);
    setIsClearModalOpen(false);
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

        <div className="chat-header-actions">
          <button
            type="button"
            className={isSelectionMode ? "chat-header-btn active" : "chat-header-btn"}
            onClick={toggleSelectionMode}
            disabled={isBusy || messages.length === 0}
          >
            {isSelectionMode ? "Cancel select" : "Select"}
          </button>

          <button
            type="button"
            className="chat-header-btn danger"
            onClick={() => setIsClearModalOpen(true)}
            disabled={isBusy || messages.length === 0}
          >
            <Trash2 size={16} />
            {isClearingConversation ? "Clearing..." : "Clear chat"}
          </button>
        </div>
      </div>

      {isSelectionMode ? (
        <div className="chat-selection-bar">
          <div className="chat-selection-copy">
            <strong>{selectedMessageIds.length}</strong> selected
          </div>

          <div className="chat-selection-actions">
            <button
              type="button"
              className="chat-selection-btn muted"
              onClick={toggleSelectionMode}
              disabled={isBusy}
            >
              <X size={16} />
              Cancel
            </button>
            <button
              type="button"
              className="chat-selection-btn danger"
              onClick={handleDeleteSelected}
              disabled={selectedMessageIds.length === 0 || isBusy}
            >
              <Trash2 size={16} />
              {isDeletingMessages ? "Deleting..." : "Delete for me"}
            </button>
          </div>
        </div>
      ) : null}

      {actionError ? <div className="chat-inline-error">{actionError}</div> : null}

      <div className="chat-messages">
        {renderedMessages.length === 0 ? (
          <div className="chat-empty-timeline">
            <h4>This side of the chat is clean.</h4>
            <p>New messages will appear here, while the other user keeps their own history.</p>
          </div>
        ) : null}

        {renderedMessages.map((message) => {
          return (
            <div key={message.id}>
              {message.showDateDivider && (
                <div className="chat-date-divider">
                  {formatAstanaRelativeDateLabel(message.rawDate)}
                </div>
              )}

              <div
                className={
                  message.isMyMessage
                    ? `chat-message-row my-message${message.isSelected ? " selected" : ""}`
                    : `chat-message-row buddy-message${message.isSelected ? " selected" : ""}`
                }
              >
                {isSelectionMode && message.isSelectable ? (
                  <button
                    type="button"
                    className={
                      message.isSelected
                        ? "chat-message-selector checked"
                        : "chat-message-selector"
                    }
                    onClick={() => toggleMessageSelection(message.id)}
                    aria-label={
                      message.isSelected ? "Unselect message" : "Select message"
                    }
                  />
                ) : null}

                <div className="chat-bubble">
                  <p>{message.text}</p>
                  <span>{message.messageTime || message.time}</span>
                </div>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-area" onSubmit={handleSubmit}>
        <input
          name="messageText"
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isClearingConversation}
        />
        <button
          type="submit"
          className={canSend ? "send-button active" : "send-button"}
          disabled={!canSend || isSending || isClearingConversation}
        >
          <Send size={18} />
        </button>
      </form>

      {isClearModalOpen ? (
        <AssistantConfirmModal
          title="Clear chat?"
          description="This will remove the chat only for you. The other user will still keep their messages."
          confirmLabel="Clear"
          isLoading={isClearingConversation}
          onCancel={() => setIsClearModalOpen(false)}
          onConfirm={handleClearChat}
        />
      ) : null}

    </div>
  );
}

export default ChatWindow;
