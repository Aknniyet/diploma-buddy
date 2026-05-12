import { Sparkles } from "lucide-react";

function AssistantHero() {
  return (
    <div className="assistant-hero">
      <div>
        <span className="assistant-eyebrow">
          <Sparkles size={16} />
          Free intelligent support
        </span>
        <h1>KazakhBuddy Assistant</h1>
        <p>
          Get quick guidance about adaptation steps, documents, events, checklist progress, and
          buddy matching.
        </p>
      </div>
    </div>
  );
}

export default AssistantHero;
