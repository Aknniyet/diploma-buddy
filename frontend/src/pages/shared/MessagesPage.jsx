import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import ConversationsList from "../../components/messages/ConversationsList";
import ChatWindow from "../../components/messages/ChatWindow";
import EmptyChatState from "../../components/messages/EmptyChatState";
import EmptyConversationsState from "../../components/messages/EmptyConversationsState";
import { apiRequest, getSavedUser } from "../../lib/api";
import { REALTIME_WINDOW_EVENT } from "../../lib/realtime";
import "../../styles/messages.css";

function MessagesPage({ userType = "student" }) {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageActionError, setMessageActionError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isDeletingMessages, setIsDeletingMessages] = useState(false);
  const [isClearingConversation, setIsClearingConversation] = useState(false);
  const [isMobileLayout, setIsMobileLayout] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia("(max-width: 768px)").matches;
  });
  const isBuddy = userType === "buddy";
  const currentUserId = getSavedUser()?.id || null;

  useEffect(() => {
    if (typeof window === "undefined") {
      return () => {};
    }

    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const handleChange = (event) => setIsMobileLayout(event.matches);

    setIsMobileLayout(mediaQuery.matches);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  const loadConversations = async ({ silent = false } = {}) => {
    if (!silent) {
      setIsLoadingConversations(true);
    }

    try {
      const data = await apiRequest("/messages/conversations");
      setConversations(data);
      setLoadError("");
      setMessageActionError("");

      setSelectedConversation((currentConversation) => {
        if (data.length === 0) {
          return null;
        }

        if (!currentConversation) {
          return isMobileLayout ? null : data[0];
        }

        const matchedConversation = data.find((item) => item.id === currentConversation.id);

        if (!matchedConversation) {
          return isMobileLayout ? null : data[0];
        }

        if (currentConversation.id === matchedConversation.id) {
          return {
            ...currentConversation,
            ...matchedConversation,
          };
        }

        return matchedConversation;
      });
    } catch (error) {
      setConversations([]);
      setSelectedConversation(null);
      setLoadError(error.message || "Could not load conversations.");
      setMessages([]);
    } finally {
      if (!silent) {
        setIsLoadingConversations(false);
      }
    }
  };

  useEffect(() => {
    loadConversations().catch(() => null);
  }, []);

  useEffect(() => {
    const handleRealtimeEvent = (event) => {
      const detail = event.detail || {};
      const realtimeType = detail.type;
      const payload = detail.payload || {};
      const notificationType = payload.notification?.type;
      const activeConversationId = selectedConversation?.id || null;
      const sameConversation =
        activeConversationId && Number(payload.conversationId) === Number(activeConversationId);

      if (realtimeType === "message.created") {
        loadConversations({ silent: true }).catch(() => null);

        if (
          sameConversation &&
          payload.message &&
          Number(payload.senderId) !== Number(currentUserId)
        ) {
          setMessages((prev) => {
            if (prev.some((message) => Number(message.id) === Number(payload.message.id))) {
              return prev;
            }

            return [
              ...prev,
              {
                ...payload.message,
                sender: "other",
              },
            ];
          });
        }

        return;
      }

      if (
        realtimeType === "message.deleted" ||
        realtimeType === "conversation.cleared" ||
        realtimeType === "conversation.read"
      ) {
        loadConversations({ silent: true }).catch(() => null);

        if (activeConversationId && Number(payload.conversationId) === Number(activeConversationId)) {
          loadMessages(activeConversationId, { silent: true }).catch(() => null);
        }

        return;
      }

      if (
        realtimeType === "match.updated" ||
        (realtimeType === "notification.created" &&
          ["match_created", "match_reassigned"].includes(notificationType))
      ) {
        loadConversations({ silent: true }).catch(() => null);
      }
    };

    window.addEventListener(REALTIME_WINDOW_EVENT, handleRealtimeEvent);
    return () => window.removeEventListener(REALTIME_WINDOW_EVENT, handleRealtimeEvent);
  }, [currentUserId, selectedConversation]);

  const loadMessages = async (conversationId, { silent = false } = {}) => {
    if (!silent) {
      setIsLoadingMessages(true);
    }

    try {
      const data = await apiRequest(`/messages/conversations/${conversationId}/messages`);
      setMessages(Array.isArray(data) ? data : []);
      setMessageActionError("");
    } catch (error) {
      setMessages([]);
      setMessageActionError(error.message || "Could not load messages.");
    } finally {
      if (!silent) {
        setIsLoadingMessages(false);
      }
    }
  };

  useEffect(() => {
    if (!selectedConversation?.id) {
      setMessages([]);
      setMessageActionError("");
      return;
    }

    setMessageActionError("");

    loadMessages(selectedConversation.id)
      .catch(() => setMessages([]));
  }, [selectedConversation?.id]);

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

      await loadConversations({ silent: true });
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
      await loadConversations({ silent: true });

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
      await loadConversations({ silent: true });
    } catch (error) {
      setMessageActionError(error.message || "Could not clear this chat.");
    } finally {
      setIsClearingConversation(false);
    }
  };

  useEffect(() => {
    if (isMobileLayout || selectedConversation || conversations.length === 0) {
      return;
    }

    setSelectedConversation(conversations[0]);
  }, [conversations, isMobileLayout, selectedConversation]);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleBackToConversations = () => {
    setSelectedConversation(null);
    setMessageActionError("");
  };

  const shouldShowConversationList = !isMobileLayout || !selectedConversation;
  const shouldShowChatPanel = !isMobileLayout || Boolean(selectedConversation);

  return (
    <DashboardLayout title="Messages" sidebarType={isBuddy ? "buddy" : "student"}>
      <section className="messages-page">
        <div className="messages-page-header">
          <h1>Messages</h1>
          <p>Messages become available after a buddy request is accepted.</p>
        </div>

        <div className="messages-layout">
          {shouldShowConversationList ? (
            isLoadingConversations ? (
              <EmptyConversationsState
                title="Loading conversations"
                description="Please wait while we load your recent chats."
              />
            ) : conversations.length > 0 ? (
              <ConversationsList
                conversations={conversations}
                selectedConversation={selectedConversation}
                onSelectConversation={handleSelectConversation}
              />
            ) : (
              <EmptyConversationsState
                title={loadError ? "Could not load conversations" : "No conversations yet"}
                description={loadError || "Accept or receive a buddy match to start chatting."}
              />
            )
          ) : null}

          {shouldShowChatPanel ? (
            selectedConversation ? (
              <ChatWindow
                conversation={selectedConversation}
                messages={messages}
                actionError={messageActionError}
                isLoadingMessages={isLoadingMessages}
                isClearingConversation={isClearingConversation}
                isDeletingMessages={isDeletingMessages}
                onBack={handleBackToConversations}
                onClearConversation={handleClearConversation}
                onDeleteMessages={handleDeleteMessages}
                onSendMessage={handleSendMessage}
                showBackButton={isMobileLayout}
              />
            ) : (
              <EmptyChatState />
            )
          ) : null}
        </div>
      </section>
    </DashboardLayout>
  );
}

export default MessagesPage;
