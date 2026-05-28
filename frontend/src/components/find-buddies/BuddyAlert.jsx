import { CheckCircle2 } from "lucide-react";

function BuddyAlert({ message }) {
  if (!message) return null;

  return (
    <div className="buddy-alert">
      <CheckCircle2 size={18} />
      <div>
        <strong>Update</strong>
        <p>{message}</p>
      </div>
    </div>
  );
}

export default BuddyAlert;
