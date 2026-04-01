import { MessageSquare } from "lucide-react";

function EmptyChatState() {
  return (
    <div className="chat-window-card empty-chat-state">
      <div className="empty-chat-content">
        <MessageSquare size={54} />
        <h3>Select a conversation</h3>
        <p>Choose a contact from the list to start messaging</p>
      </div>
    </div>
  );
}

export default EmptyChatState;