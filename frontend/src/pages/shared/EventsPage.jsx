import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadEvents = useCallback(async () => {
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
  }, [hasEventsAccess]);

  useEffect(() => {
    loadEvents().catch(() => null);
  }, [loadEvents]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);

    return () => window.clearInterval(timer);
  }, []);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return events;

    return events.filter((item) =>
      [item.title, item.description, item.location, item.category]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [events, search]);

  const { upcomingEvents, pastEvents } = useMemo(() => {
    const groupedEvents = filteredEvents.reduce(
      (groups, item) => {
        const eventTime = new Date(item.event_date).getTime();

        if (eventTime >= currentTime) {
          groups.upcoming.push(item);
        } else {
          groups.past.push(item);
        }

        return groups;
      },
      { upcoming: [], past: [] }
    );

    groupedEvents.upcoming.sort(
      (first, second) => new Date(first.event_date).getTime() - new Date(second.event_date).getTime()
    );
    groupedEvents.past.sort(
      (first, second) => new Date(second.event_date).getTime() - new Date(first.event_date).getTime()
    );

    return {
      upcomingEvents: groupedEvents.upcoming,
      pastEvents: groupedEvents.past,
    };
  }, [filteredEvents, currentTime]);

  const handleEventImageLoad = (event) => {
    const image = event.currentTarget;
    const hero = image.closest(".event-card-hero");

    if (!hero) return;

    hero.dataset.orientation =
      image.naturalHeight > image.naturalWidth ? "portrait" : "landscape";
  };

  const renderEventCard = (item, status) => (
    <article className={`event-card ${status === "past" ? "event-card-past" : ""}`} key={item.id}>
      {item.image_url ? (
        <div className="event-card-hero">
          <img
            src={item.image_url}
            alt={item.title}
            className="event-card-image"
            onLoad={handleEventImageLoad}
          />
        </div>
      ) : null}

      <div className="event-card-content">
        <div className="event-card-top">
          <span className="event-badge">{item.category || "General"}</span>
          <span className={`event-status event-status-${status}`}>
            {status === "upcoming" ? "Upcoming" : "Past"}
          </span>
        </div>

        <h3>{item.title}</h3>

        <div className="event-details">
          <span>{formatAstanaShortDateTime(item.event_date)}</span>
          <span>{item.location || "Location TBD"}</span>
        </div>

        <p>{item.description || "Event details will be shared soon."}</p>
      </div>
    </article>
  );

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

        <div className="events-content">
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
            <div className="events-sections">
              <section className="events-section events-section-primary">
                <div className="events-section-header">
                  <div>
                    <h2>Upcoming Events</h2>
                    <p>Planned campus activities sorted by the nearest date and time.</p>
                  </div>
                  <span>{upcomingEvents.length}</span>
                </div>

                {upcomingEvents.length > 0 ? (
                  <div className="events-grid">
                    {upcomingEvents.map((item) => renderEventCard(item, "upcoming"))}
                  </div>
                ) : (
                  <div className="events-empty-card">
                    <CalendarDays size={28} />
                    <h3>No upcoming events yet</h3>
                    <p>New activities will appear here when they are scheduled.</p>
                  </div>
                )}
              </section>

              <section className="events-section events-section-secondary">
                <div className="events-section-header">
                  <div>
                    <h2>Past Events</h2>
                    <p>Recently finished activities, sorted from newest to oldest.</p>
                  </div>
                  <span>{pastEvents.length}</span>
                </div>

                {pastEvents.length > 0 ? (
                  <div className="events-grid events-grid-secondary">
                    {pastEvents.map((item) => renderEventCard(item, "past"))}
                  </div>
                ) : (
                  <div className="events-empty-card events-empty-card-secondary">
                    <CalendarDays size={24} />
                    <h3>No past events yet</h3>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </section>
    </DashboardLayout>
  );
}

export default EventsPage;
