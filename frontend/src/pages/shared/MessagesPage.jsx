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
  const [messageActionError, setMessageActionError] = useState("");
  const [isDeletingMessages, setIsDeletingMessages] = useState(false);
  const [isClearingConversation, setIsClearingConversation] = useState(false);
  const isBuddy = userType === "buddy";

  const loadConversations = async () => {
    const data = await apiRequest("/messages/conversations");
    setConversations(data);

    setSelectedConversation((currentConversation) => {
      if (data.length === 0) {
        return null;
      }

      if (!currentConversation) {
        return data[0];
      }

      return data.find((item) => item.id === currentConversation.id) || data[0];
    });
  };

  useEffect(() => {
    loadConversations().catch(() => null);
  }, []);

  const loadMessages = async (conversationId) => {
    const data = await apiRequest(`/messages/conversations/${conversationId}/messages`);
    setMessages(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      setMessageActionError("");
      return;
    }

    setMessageActionError("");

    loadMessages(selectedConversation.id)
      .catch(() => setMessages([]));
  }, [selectedConversation]);

  const handleSendMessage = async (text) => {
    if (!selectedConversation) return;

    const optimisticMessageId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: optimisticMessageId,
      text,
      sender: "me",
      date: new Date().toISOString(),
      isPending: true,
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const result = await apiRequest(
        `/messages/conversations/${selectedConversation.id}/messages`,
        {
          method: "POST",
          body: JSON.stringify({ text }),
        }
      );

      setMessages((prev) =>
        prev.map((message) =>
          message.id === optimisticMessageId
            ? { ...result.message, isPending: false }
            : message
        )
      );

      await loadConversations();
    } catch (error) {
      setMessages((prev) => prev.filter((message) => message.id !== optimisticMessageId));
      throw error;
    }
  };

  const handleDeleteMessages = async (messageIds) => {
    if (!selectedConversation || messageIds.length === 0) {
      return [];
    }

    setIsDeletingMessages(true);
    setMessageActionError("");

    try {
      const result = await apiRequest(
        `/messages/conversations/${selectedConversation.id}/messages`,
        {
          method: "DELETE",
          body: JSON.stringify({ messageIds }),
        }
      );

      const deletedMessageIds = Array.isArray(result.deletedMessageIds)
        ? result.deletedMessageIds
        : messageIds;

      setMessages((prev) =>
        prev.filter((message) => !deletedMessageIds.includes(message.id))
      );
      await loadConversations();

      return deletedMessageIds;
    } catch (error) {
      setMessageActionError(error.message || "Could not delete messages.");
      throw error;
    } finally {
      setIsDeletingMessages(false);
    }
  };

  const handleClearConversation = async () => {
    if (!selectedConversation) {
      return;
    }

    setIsClearingConversation(true);
    setMessageActionError("");

    try {
      await apiRequest(`/messages/conversations/${selectedConversation.id}/clear`, {
        method: "POST",
      });

      setMessages([]);
      await loadConversations();
    } catch (error) {
      setMessageActionError(error.message || "Could not clear this chat.");
      throw error;
    } finally {
      setIsClearingConversation(false);
    }
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
              actionError={messageActionError}
              isClearingConversation={isClearingConversation}
              isDeletingMessages={isDeletingMessages}
              onClearConversation={handleClearConversation}
              onDeleteMessages={handleDeleteMessages}
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
