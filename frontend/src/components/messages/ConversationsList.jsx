function ConversationsList({
  conversations,
  selectedConversation,
  onSelectConversation,
}) {
  return (
    <div className="messages-sidebar-card">
      <div className="messages-card-header">
        <h3>Conversations</h3>
      </div>

      <div className="conversations-list">
        {conversations.map((conversation) => {
          const isActive = selectedConversation?.id === conversation.id;

          return (
            <button
              key={conversation.id}
              type="button"
              className={
                isActive
                  ? "conversation-item active"
                  : "conversation-item"
              }
              onClick={() => onSelectConversation(conversation)}
            >
              <img
                src={conversation.avatar}
                alt={conversation.name}
                className="conversation-avatar"
              />

              <div className="conversation-text">
                <h4>{conversation.name}</h4>
                <p>{conversation.preview}</p>
              </div>

              {conversation.unreadCount > 0 ? (
                <span className="conversation-unread-badge">
                  {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ConversationsList;
