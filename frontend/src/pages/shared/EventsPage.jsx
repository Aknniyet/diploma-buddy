import { useEffect, useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { apiRequest } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import "../../styles/events.css";

function EventsPage({ userType = "student" }) {
  const { user } = useAuth();
  const hasEventsAccess = userType !== "buddy" || user?.buddy_status === "approved";
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!hasEventsAccess) {
      setEvents([]);
      return;
    }

    apiRequest("/events")
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch(() => null);
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
          ) : (
            filteredEvents.map((item) => (
              <article className="event-card" key={item.id}>
                <div className="event-card-top">
                  <span className="event-badge">{item.category || "General"}</span>
                  <span className="event-date">
                    {new Date(item.event_date).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
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
