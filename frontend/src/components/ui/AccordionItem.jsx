import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

function AccordionItem({ title, content }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="accordion-item">
      <button
        className="accordion-header"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span>{title}</span>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {isOpen && <div className="accordion-content">{content}</div>}
    </div>
  );
}

export default AccordionItem;