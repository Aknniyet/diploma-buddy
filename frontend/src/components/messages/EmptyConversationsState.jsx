import { MessageSquare } from "lucide-react";

function EmptyConversationsState({ title, description }) {
  return (
    <div className="messages-sidebar-card empty-conversations-state">
      <div className="messages-card-header">
        <h3>Conversations</h3>
      </div>

      <div className="empty-conversations-content">
        <MessageSquare size={54} />
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default EmptyConversationsState;