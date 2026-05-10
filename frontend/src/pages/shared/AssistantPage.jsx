import { useState } from "react";
import { Bot, Send, Sparkles, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { apiRequest } from "../../lib/api";
import "../../styles/assistant.css";

const starterQuestions = [
  "What should I do next?",
  "How can I get IIN?",
  "How do I find a buddy?",
  "Where can I see events?",
];

function getSidebarType(userType) {
  return userType === "buddy" ? "buddy" : "student";
}

function AssistantPage({ userType = "student" }) {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [chat, setChat] = useState([
    {
      id: 1,
      sender: "assistant",
      text:
        "Hi! I am your KazakhBuddy assistant. Ask me about adaptation, documents, checklist, events, or buddy matching.",
      actions: [],
    },
  ]);

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

  return (
    <DashboardLayout title="AI Assistant" sidebarType={getSidebarType(userType)}>
      <section className="assistant-page">
        <div className="assistant-hero">
          <div>
            <span className="assistant-eyebrow">
              <Sparkles size={16} />
              Free intelligent support
            </span>
            <h1>KazakhBuddy Assistant</h1>
            <p>
              Get quick guidance about adaptation steps, documents, events,
              checklist progress, and buddy matching.
            </p>
          </div>
        </div>

        <div className="assistant-layout">
          <div className="assistant-chat-card">
            <div className="assistant-messages">
              {chat.map((item) => (
                <div
                  key={item.id}
                  className={`assistant-message ${
                    item.sender === "user" ? "assistant-message-user" : ""
                  }`}
                >
                  <div className="assistant-message-icon">
                    {item.sender === "user" ? <UserRound size={18} /> : <Bot size={18} />}
                  </div>

                  <div className="assistant-message-content">
                    <p>{item.text}</p>

                    {item.actions.length > 0 ? (
                      <div className="assistant-actions">
                        {item.actions.map((action) => (
                          <button
                            key={action.label}
                            type="button"
                            onClick={() => navigate(action.path)}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}

              {isSending ? (
                <div className="assistant-message">
                  <div className="assistant-message-icon">
                    <Bot size={18} />
                  </div>
                  <div className="assistant-message-content">
                    <p>Thinking...</p>
                  </div>
                </div>
              ) : null}
            </div>

            <form className="assistant-input-row" onSubmit={handleSubmit}>
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ask about IIN, checklist, events, or buddy matching..."
              />
              <button type="submit" disabled={!message.trim() || isSending}>
                <Send size={18} />
                Send
              </button>
            </form>
          </div>

          <aside className="assistant-suggestions">
            <h3>Try asking</h3>
            <div className="assistant-starter-list">
              {starterQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => sendMessage(question)}
                  disabled={isSending}
                >
                  {question}
                </button>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </DashboardLayout>
  );
}

export default AssistantPage;
