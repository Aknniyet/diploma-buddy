function RequestsTabs({ activeTab, onChangeTab, pendingCount }) {
  return (
    <div className="buddy-requests-tabs">
      <button
        type="button"
        className={
          activeTab === "pending"
            ? "buddy-tab-button active"
            : "buddy-tab-button"
        }
        onClick={() => onChangeTab("pending")}
      >
        <span>Pending</span>
        <span className="buddy-tab-count">{pendingCount}</span>
      </button>

      <button
        type="button"
        className={
          activeTab === "past"
            ? "buddy-tab-button active"
            : "buddy-tab-button"
        }
        onClick={() => onChangeTab("past")}
      >
        <span>Past Requests</span>
      </button>
    </div>
  );
}

export default RequestsTabs;