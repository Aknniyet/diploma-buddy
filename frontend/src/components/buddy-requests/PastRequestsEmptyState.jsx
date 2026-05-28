import { History } from "lucide-react";

function PastRequestsEmptyState() {
  return (
    <div className="buddy-past-empty-card">
      <div className="buddy-past-empty-content">
        <History size={56} />
        <h3>No past requests</h3>
        <p>Your accepted and declined requests will appear here.</p>
      </div>
    </div>
  );
}

export default PastRequestsEmptyState;