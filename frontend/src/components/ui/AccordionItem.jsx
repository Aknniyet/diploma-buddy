import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

function AccordionItem({ title, content, link, links }) {
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

      {isOpen && (
        <div className="accordion-content">
          <p>{content}</p>

          {link && (
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              className="calendar-link"
            >
              Download PDF
            </a>
          )}

          {links && links.length > 0 && (
            <div className="links-list">
              {links.map((item, index) => (
                <a
                  key={index}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="calendar-link"
                >
                  {item.label}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AccordionItem;