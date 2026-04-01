import { Search } from "lucide-react";

function SearchBar({ searchValue, onSearchChange }) {
  return (
    <div className="buddy-search">
      <Search size={16} className="buddy-search-icon" />
      <input
        type="text"
        placeholder="Search by name, city, language, or interest..."
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
}

export default SearchBar;