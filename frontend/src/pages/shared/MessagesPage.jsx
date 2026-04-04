import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import ConversationsList from "../../components/messages/ConversationsList";
import ChatWindow from "../../components/messages/ChatWindow";
import EmptyChatState from "../../components/messages/EmptyChatState";
import EmptyConversationsState from "../../components/messages/EmptyConversationsState";
import { apiRequest } from "../../lib/api";
import "../../styles/messages.css";

function MessagesPage({ userType = "student" }) {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const isBuddy = userType === "buddy";

  const loadConversations = async () => {
    const data = await apiRequest("/messages/conversations");
    setConversations(data);
    if (!selectedConversation && data.length > 0) {
      setSelectedConversation(data[0]);
    }
  };

  useEffect(() => {
    loadConversations().catch(() => null);
  }, []);

  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }

    apiRequest(`/messages/conversations/${selectedConversation.id}/messages`)
      .then(setMessages)
      .catch(() => setMessages([]));
  }, [selectedConversation]);

  const handleSendMessage = async (text) => {
    if (!selectedConversation) return;
    const result = await apiRequest(
      `/messages/conversations/${selectedConversation.id}/messages`,
      {
        method: "POST",
        body: JSON.stringify({ text }),
      }
    );
    setMessages((prev) => [...prev, result.message]);
    await loadConversations();
  };

  return (
    <DashboardLayout title="Messages" sidebarType={isBuddy ? "buddy" : "student"}>
      <section className="messages-page">
        <div className="messages-page-header">
          <h1>Messages</h1>
          <p>Chat becomes available after a buddy request is accepted.</p>
        </div>

        <div className="messages-layout">
          {conversations.length > 0 ? (
            <ConversationsList
              conversations={conversations}
              selectedConversation={selectedConversation}
              onSelectConversation={setSelectedConversation}
            />
          ) : (
            <EmptyConversationsState
              title="No conversations yet"
              description="Accept or receive a match to start chatting."
            />
          )}

          {selectedConversation ? (
            <ChatWindow
              conversation={selectedConversation}
              messages={messages}
              onSendMessage={handleSendMessage}
            />
          ) : (
            <EmptyChatState />
          )}
        </div>
      </section>
    </DashboardLayout>
  );
}

export default MessagesPage;
