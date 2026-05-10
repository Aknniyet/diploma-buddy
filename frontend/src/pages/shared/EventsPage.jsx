import { useEffect, useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { apiRequest } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { formatAstanaShortDateTime } from "../../utils/datetime";
import "../../styles/events.css";

function EventsPage({ userType = "student" }) {
  const { user } = useAuth();
  const hasEventsAccess = userType !== "buddy" || user?.buddy_status === "approved";
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadEvents = async () => {
    if (!hasEventsAccess) {
      setEvents([]);
      setError("");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const data = await apiRequest("/events");
      setEvents(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setEvents([]);
      setError(requestError?.message || "Could not load events right now.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents().catch(() => null);
  }, [hasEventsAccess]);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return events;

    return events.filter((item) =>
      [item.title, item.description, item.location, item.category]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [events, search]);

  return (
    <DashboardLayout title="Events" sidebarType={userType === "buddy" ? "buddy" : "student"}>
      <section className="events-page">
        <div className="events-page-header">
          <h1>University Events</h1>
          <p>See what is happening on campus and across the student community.</p>
        </div>

        {hasEventsAccess ? (
          <div className="events-toolbar">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, location, or category..."
            />
          </div>
        ) : null}

        <div className="events-grid">
          {!hasEventsAccess ? (
            <div className="events-empty-card">
              <CalendarDays size={28} />
              <h3>No events yet</h3>
              <p>Upcoming events will become available after admin approval.</p>
            </div>
          ) : isLoading ? (
            <div className="events-empty-card">
              <CalendarDays size={28} />
              <h3>Loading events</h3>
              <p>Please wait a moment while we load the latest activities.</p>
            </div>
          ) : error ? (
            <div className="events-empty-card">
              <CalendarDays size={28} />
              <h3>Could not load events</h3>
              <p>{error}</p>
              <button type="button" className="events-retry-btn" onClick={() => loadEvents().catch(() => null)}>
                Try again
              </button>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="events-empty-card">
              <CalendarDays size={28} />
              <h3>{search.trim() ? "No matching events" : "No events published yet"}</h3>
              <p>
                {search.trim()
                  ? "Try a different keyword for title, location, or category."
                  : "Events will appear here as soon as an administrator publishes them."}
              </p>
            </div>
          ) : (
            filteredEvents.map((item) => (
              <article className="event-card" key={item.id}>
                <div className="event-card-top">
                  <span className="event-badge">{item.category || "General"}</span>
                  <span className="event-date">{formatAstanaShortDateTime(item.event_date)}</span>
                </div>

                <h3>{item.title}</h3>
                <p>{item.description || "Event details will be shared soon."}</p>

                <div className="event-meta">
                  <span>{item.location || "Location TBD"}</span>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </DashboardLayout>
  );
}

export default EventsPage;
