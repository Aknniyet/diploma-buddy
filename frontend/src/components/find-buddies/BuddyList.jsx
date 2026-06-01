import BuddyCard from "./BuddyCard";

function BuddyList({ buddies = [], onConnect, onLeaveFeedback, onRequestReassignment, searchValue = "" }) {
  if (buddies.length === 0) {
    const isSearching = searchValue.trim().length > 0;
    return (
      <div className="buddy-empty-state centered">
        <h3>{isSearching ? "No matches found" : "No buddies available yet"}</h3>
        <p>{isSearching ? "Try another search or clear the search field to see all available buddies." : "Approved buddies will appear here as soon as they become available."}</p>
      </div>
    );
  }

  return (
    <div className="buddy-grid">
      {buddies.map((buddy) => (
        <BuddyCard
          key={buddy.id}
          buddy={buddy}
          onConnect={onConnect}
          onLeaveFeedback={onLeaveFeedback}
          onRequestReassignment={onRequestReassignment}
        />
      ))}
    </div>
  );
}

export default BuddyList;
