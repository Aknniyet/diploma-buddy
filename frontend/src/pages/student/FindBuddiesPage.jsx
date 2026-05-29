import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import SearchBar from "../../components/find-buddies/SearchBar";
import BuddyAlert from "../../components/find-buddies/BuddyAlert";
import BuddyList from "../../components/find-buddies/BuddyList";
import BuddyRequestModal from "../../components/find-buddies/BuddyRequestModal";
import BuddyFeedbackModal from "../../components/find-buddies/BuddyFeedbackModal";
import { apiRequest } from "../../lib/api";
import "../../styles/find-buddies.css";

function ReassignmentRequestModal({ buddy, reason, isSubmitting, onReasonChange, onClose, onSubmit }) {
  if (!buddy) return null;

  return (
    <div className="buddy-modal-overlay" onClick={onClose}>
      <div className="buddy-modal feedback-modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="buddy-modal-close" onClick={onClose}>
          <X size={24} />
        </button>
        <h2>Request reassignment</h2>
        <p className="buddy-modal-subtitle">
          Admin will review your request and decide whether to assign a different buddy.
        </p>
        <div className="buddy-modal-user">
          <img src={buddy.avatar} alt={buddy.name} className="buddy-modal-avatar" />
          <div>
            <h3>{buddy.name}</h3>
            <p>{buddy.program}</p>
          </div>
        </div>
        <label className="buddy-modal-label" htmlFor="reassignment-reason">
          Reason for reassignment
        </label>
        <textarea
          id="reassignment-reason"
          className="buddy-modal-textarea"
          value={reason}
          onChange={(event) => onReasonChange(event.target.value)}
          placeholder="Briefly explain why you need a different buddy."
          rows={5}
        />
        <button
          type="button"
          className="buddy-modal-submit"
          onClick={onSubmit}
          disabled={isSubmitting || reason.trim().length < 10}
        >
          {isSubmitting ? "Sending..." : "Send Request"}
        </button>
      </div>
    </div>
  );
}

function FindBuddiesPage() {
  const [searchValue, setSearchValue] = useState("");
  const [selectedBuddy, setSelectedBuddy] = useState(null);
  const [feedbackBuddy, setFeedbackBuddy] = useState(null);
  const [reassignmentBuddy, setReassignmentBuddy] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [reassignmentReason, setReassignmentReason] = useState("");
  const [isSubmittingReassignment, setIsSubmittingReassignment] = useState(false);
  const [buddies, setBuddies] = useState([]);
  const [alertMessage, setAlertMessage] = useState("");

  const loadBuddies = async () => {
    try {
      const data = await apiRequest("/buddy/available");
      setBuddies(data);
      const currentBuddy = data.find((buddy) => buddy.status === "matched");
      if (currentBuddy) {
        setAlertMessage(`Your current buddy is ${currentBuddy.name}. Other buddy requests are disabled while this match is active.`);
        return;
      }

      const pendingBuddy = data.find((buddy) => buddy.status === "pending");
      if (pendingBuddy) {
        setAlertMessage(`Your request to ${pendingBuddy.name} is pending. Please wait for their response before choosing another buddy.`);
        return;
      }

      setAlertMessage("");
    } catch (error) {
      setAlertMessage(error.message);
    }
  };

  useEffect(() => {
    loadBuddies();
  }, []);

  const filteredBuddies = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) return buddies;

    return buddies.filter((buddy) =>
      [buddy.name, buddy.city, buddy.program, buddy.languages, buddy.bio, buddy.preferredMeetingMode, ...(buddy.interests || []), ...(buddy.supportAreas || [])]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [buddies, searchValue]);

  const handleSendRequest = async (data) => {
    try {
      const response = await apiRequest("/buddy/requests", {
        method: "POST",
        body: JSON.stringify({
          buddyId: data.buddyId,
          message: data.message,
          supportTopics: data.supportTopics || [],
        }),
      });
      setAlertMessage(response.message);
      setIsModalOpen(false);
      setSelectedBuddy(null);
      await loadBuddies();
    } catch (error) {
      setAlertMessage(error.message);
    }
  };

  const handleSaveFeedback = async (data) => {
    try {
      const response = await apiRequest("/buddy/feedback", {
        method: "POST",
        body: JSON.stringify(data),
      });
      setAlertMessage(response.message);
      setIsFeedbackModalOpen(false);
      setFeedbackBuddy(null);
      await loadBuddies();
    } catch (error) {
      setAlertMessage(error.message);
    }
  };

  const handleRequestReassignment = async () => {
    if (!reassignmentBuddy?.matchId) return;

    setIsSubmittingReassignment(true);
    try {
      const response = await apiRequest(`/buddy/matches/${reassignmentBuddy.matchId}/reassignment-request`, {
        method: "POST",
        body: JSON.stringify({ reason: reassignmentReason }),
      });
      setAlertMessage(response.message);
      setBuddies((prev) =>
        prev.map((buddy) =>
          buddy.matchId === reassignmentBuddy.matchId
            ? { ...buddy, hasPendingReassignment: true }
            : buddy
        )
      );
      setReassignmentBuddy(null);
      setReassignmentReason("");
      await loadBuddies();
      setBuddies((prev) =>
        prev.map((buddy) =>
          buddy.matchId === reassignmentBuddy.matchId
            ? { ...buddy, hasPendingReassignment: true }
            : buddy
        )
      );
    } catch (error) {
      setAlertMessage(error.message);
    } finally {
      setIsSubmittingReassignment(false);
    }
  };

  return (
    <DashboardLayout title="Find Buddies" sidebarType="student">
      <section className="find-buddies-page">
        <div className="find-buddies-header">
          <h1>Find a Buddy</h1>
          <p>Browse approved buddies sorted by compatibility score.</p>
        </div>
        <SearchBar searchValue={searchValue} onSearchChange={setSearchValue} />
        <BuddyAlert message={alertMessage} />
        <BuddyList
          buddies={filteredBuddies}
          searchValue={searchValue}
          onConnect={(buddy) => {
            if (buddy.status === "locked" || buddy.status === "matched" || buddy.status === "waiting") return;
            setSelectedBuddy(buddy);
            setIsModalOpen(true);
          }}
          onLeaveFeedback={(buddy) => {
            setFeedbackBuddy(buddy);
            setIsFeedbackModalOpen(true);
          }}
          onRequestReassignment={(buddy) => {
            setReassignmentBuddy(buddy);
            setReassignmentReason("");
          }}
        />
        <BuddyRequestModal buddy={selectedBuddy} isOpen={isModalOpen} onClose={() => { setSelectedBuddy(null); setIsModalOpen(false); }} onSend={handleSendRequest} />
        <BuddyFeedbackModal
          buddy={feedbackBuddy}
          isOpen={isFeedbackModalOpen}
          onClose={() => {
            setFeedbackBuddy(null);
            setIsFeedbackModalOpen(false);
          }}
          onSave={handleSaveFeedback}
        />
        <ReassignmentRequestModal
          buddy={reassignmentBuddy}
          reason={reassignmentReason}
          isSubmitting={isSubmittingReassignment}
          onReasonChange={setReassignmentReason}
          onClose={() => {
            setReassignmentBuddy(null);
            setReassignmentReason("");
          }}
          onSubmit={handleRequestReassignment}
        />
      </section>
    </DashboardLayout>
  );
}

export default FindBuddiesPage;
