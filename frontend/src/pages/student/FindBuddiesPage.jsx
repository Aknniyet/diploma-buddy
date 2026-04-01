import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import SearchBar from "../../components/find-buddies/SearchBar";
import BuddyAlert from "../../components/find-buddies/BuddyAlert";
import BuddyList from "../../components/find-buddies/BuddyList";
import BuddyRequestModal from "../../components/find-buddies/BuddyRequestModal";
import { apiRequest } from "../../lib/api";
import "../../styles/find-buddies.css";

function FindBuddiesPage() {
  const [searchValue, setSearchValue] = useState("");
  const [selectedBuddy, setSelectedBuddy] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [buddies, setBuddies] = useState([]);
  const [alertMessage, setAlertMessage] = useState("");

  const loadBuddies = async () => {
    try {
      const data = await apiRequest("/buddy/available");
      setBuddies(data);
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
      [buddy.name, buddy.city, buddy.program, buddy.languages, buddy.bio, ...(buddy.interests || [])]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [buddies, searchValue]);

  const handleSendRequest = async (data) => {
    try {
      const response = await apiRequest("/buddy/requests", {
        method: "POST",
        body: JSON.stringify({ buddyId: data.buddyId, message: data.message }),
      });
      setAlertMessage(response.message);
      setIsModalOpen(false);
      setSelectedBuddy(null);
      await loadBuddies();
    } catch (error) {
      setAlertMessage(error.message);
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
        <BuddyList buddies={filteredBuddies} searchValue={searchValue} onConnect={(buddy) => { setSelectedBuddy(buddy); setIsModalOpen(true); }} />
        <BuddyRequestModal buddy={selectedBuddy} isOpen={isModalOpen} onClose={() => { setSelectedBuddy(null); setIsModalOpen(false); }} onSend={handleSendRequest} />
      </section>
    </DashboardLayout>
  );
}

export default FindBuddiesPage;
