import { useEffect, useMemo, useRef, useState } from "react";
import {
  POPULAR_LANGUAGE_OPTIONS,
  filterLanguageOptions,
} from "../../utils/userValidation";

function LanguageSelector({
  selectedLanguages,
  onToggle,
  helperText = "",
  emptyText = "No languages selected yet.",
  selectPlaceholder = "Select languages",
  searchPlaceholder = "Search languages...",
  noResultsText = "No matching languages found.",
  triggerClassName = "signup-select",
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const hasReachedLimit = selectedLanguages.length >= 5;

  const filteredLanguages = useMemo(() => filterLanguageOptions(query), [query]);
  const orderedLanguages = useMemo(() => {
    const popular = POPULAR_LANGUAGE_OPTIONS.filter((language) =>
      filteredLanguages.includes(language)
    );
    const others = filteredLanguages.filter(
      (language) => !POPULAR_LANGUAGE_OPTIONS.includes(language)
    );

    return [...popular, ...others];
  }, [filteredLanguages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const triggerText =
    selectedLanguages.length > 0 ? selectedLanguages.join(", ") : selectPlaceholder;

  return (
    <div className="language-selector" ref={rootRef}>
      <button
        type="button"
        className={`${triggerClassName} language-multiselect-trigger ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className={selectedLanguages.length > 0 ? "has-value" : "placeholder"}>
          {triggerText}
        </span>
        <span className="language-multiselect-arrow">v</span>
      </button>

      {isOpen ? (
        <div className="language-options-panel">
          <input
            type="text"
            className="language-search-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
          />

          <div className="language-option-list plain">
            {orderedLanguages.map((language) => {
              const isSelected = selectedLanguages.includes(language);
              const isDisabled = hasReachedLimit && !isSelected;

              return (
                <button
                  key={language}
                  type="button"
                  className={`language-option-row ${isSelected ? "selected" : ""}`}
                  disabled={isDisabled}
                  onClick={() => onToggle(language)}
                >
                  <span>{language}</span>
                  <span className="language-option-mark">{isSelected ? "v" : ""}</span>
                </button>
              );
            })}
          </div>

          {orderedLanguages.length === 0 ? (
            <div className="language-no-results">{noResultsText}</div>
          ) : null}
        </div>
      ) : null}

      {helperText ? <small>{helperText}</small> : null}
      {!helperText && selectedLanguages.length === 0 ? <small>{emptyText}</small> : null}
    </div>
  );
}

export default LanguageSelector;
