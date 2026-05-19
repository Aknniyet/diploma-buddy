import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import AssistantChatCard from "../../components/assistant/AssistantChatCard";
import AssistantConfirmModal from "../../components/assistant/AssistantConfirmModal";
import AssistantHero from "../../components/assistant/AssistantHero";
import AssistantSuggestions from "../../components/assistant/AssistantSuggestions";
import { apiRequest } from "../../lib/api";
import "../../styles/assistant.css";

const INITIAL_ASSISTANT_MESSAGE = {
  id: 1,
  sender: "assistant",
  text:
    "Hi! I am your KazakhBuddy assistant. Ask me about adaptation, documents, checklist, events, or buddy matching.",
  actions: [],
};

const STARTER_QUESTIONS = [
  "What should I do next?",
  "How can I get IIN?",
  "How do I find a buddy?",
  "What if my buddy is not replying?",
  "Where can I see events?",
  "How do I get a SIM card?",
  "I feel lonely in Kazakhstan. What can I do?",
  "How can I understand campus better?",
  "What should I know about local culture?",
  "What should I do if I feel unsafe?",
];

function getChatStorageKey(userType) {
  return `kazakhbuddy-assistant-chat-${userType}`;
}

function AssistantPage({ userType = "student" }) {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const messagesRef = useRef(null);
  const chatStorageKey = getChatStorageKey(userType);

  const [chat, setChat] = useState(() => {
    try {
      const savedChat = localStorage.getItem(chatStorageKey);

      if (!savedChat) {
        return [INITIAL_ASSISTANT_MESSAGE];
      }

      const parsedChat = JSON.parse(savedChat);

      return Array.isArray(parsedChat) && parsedChat.length > 0
        ? parsedChat
        : [INITIAL_ASSISTANT_MESSAGE];
    } catch {
      return [INITIAL_ASSISTANT_MESSAGE];
    }
  });

  useEffect(() => {
    localStorage.setItem(chatStorageKey, JSON.stringify(chat));
  }, [chat, chatStorageKey]);

  useEffect(() => {
    if (!messagesRef.current) {
      return;
    }

    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [chat, isSending]);

  const sendMessage = async (text = message) => {
    const trimmed = text.trim();

    if (!trimmed || isSending) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: trimmed,
      actions: [],
    };

    setChat((prev) => [...prev, userMessage]);
    setMessage("");
    setIsSending(true);

    try {
      const data = await apiRequest("/assistant/chat", {
        method: "POST",
        body: JSON.stringify({ message: trimmed }),
      });

      const assistantMessage = {
        id: Date.now() + 1,
        sender: "assistant",
        text: data.reply.answer,
        actions: data.reply.actions || [],
      };

      setChat((prev) => [...prev, assistantMessage]);
    } catch {
      setChat((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          sender: "assistant",
          text: "Sorry, I could not answer right now. Please try again later.",
          actions: [],
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  const clearChat = () => {
    setChat([INITIAL_ASSISTANT_MESSAGE]);
    setMessage("");
    localStorage.removeItem(chatStorageKey);
    setIsClearModalOpen(false);
  };

  return (
    <DashboardLayout title="AI Assistant" sidebarType="student">
      <section className="assistant-page">
        <AssistantHero />

        <div className="assistant-layout">
          <AssistantChatCard
            chat={chat}
            isSending={isSending}
            message={message}
            messagesRef={messagesRef}
            onMessageChange={(event) => setMessage(event.target.value)}
            onSubmit={handleSubmit}
            onNavigate={navigate}
          />

          <AssistantSuggestions
            starterQuestions={STARTER_QUESTIONS}
            isSending={isSending}
            onSendQuestion={sendMessage}
            onOpenClearModal={() => setIsClearModalOpen(true)}
          />
        </div>

        {isClearModalOpen ? (
          <AssistantConfirmModal
            onCancel={() => setIsClearModalOpen(false)}
            onConfirm={clearChat}
          />
        ) : null}
      </section>
    </DashboardLayout>
  );
}

export default AssistantPage;
