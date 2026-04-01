import BuddyCard from "./BuddyCard";

function BuddyList({ buddies = [], onConnect, searchValue = "" }) {
  if (buddies.length === 0) {
    const isSearching = searchValue.trim().length > 0;
    return (
      <div className="buddy-empty-state centered">
        <h3>No buddies found</h3>
        <p>{isSearching ? "Try another search or clear the search field to see all available buddies." : "There are no available buddies yet. Create a buddy account or try again later."}</p>
      </div>
    );
  }

  return <div className="buddy-grid">{buddies.map((buddy) => <BuddyCard key={buddy.id} buddy={buddy} onConnect={onConnect} />)}</div>;
}

export default BuddyList;
