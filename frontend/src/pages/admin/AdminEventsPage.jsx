import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { apiRequest } from "../../lib/api";
import "../../styles/admin.css";

const initialForm = {
  title: "",
  description: "",
  eventDate: "",
  location: "",
  category: "",
};

function formatInputDate(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset();
  const normalized = new Date(date.getTime() - offset * 60000);
  return normalized.toISOString().slice(0, 16);
}

function AdminEventsPage() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState("");

  const loadEvents = async () => {
    const data = await apiRequest("/events");
    setEvents(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadEvents().catch(() => null);
  }, []);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const endpoint = editingId ? `/events/${editingId}` : "/events";
    const method = editingId ? "PATCH" : "POST";

    await apiRequest(endpoint, {
      method,
      body: JSON.stringify({
        ...form,
        eventDate: new Date(form.eventDate).toISOString(),
      }),
    });

    setStatus(editingId ? "Event updated successfully." : "Event published successfully.");
    resetForm();
    await loadEvents();
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title || "",
      description: item.description || "",
      eventDate: formatInputDate(item.event_date),
      location: item.location || "",
      category: item.category || "",
    });
    setStatus("");
  };

  const handleDelete = async (eventId) => {
    await apiRequest(`/events/${eventId}`, { method: "DELETE" });
    setStatus("Event deleted.");
    if (editingId === eventId) {
      resetForm();
    }
    await loadEvents();
  };

  return (
    <DashboardLayout title="Events Management" sidebarType="admin">
      <section className="admin-page">
        <div className="admin-page-header">
          <h1>Admin Events</h1>
          <p>Create and publish activities happening around the university.</p>
        </div>

        <div className="admin-two-column">
          <div className="dashboard-card admin-form-card">
            <div className="admin-section-header">
              <h3>{editingId ? "Edit event" : "Create event"}</h3>
              <p>Use this panel to publish official university activities.</p>
            </div>

            {status ? <div className="admin-status">{status}</div> : null}

            <form className="admin-form" onSubmit={handleSubmit}>
              <label>
                <span>Title</span>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  required
                />
              </label>

              <label>
                <span>Description</span>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                />
              </label>

              <label>
                <span>Date and time</span>
                <input
                  type="datetime-local"
                  value={form.eventDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, eventDate: e.target.value }))}
                  required
                />
              </label>

              <label>
                <span>Location</span>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                />
              </label>

              <label>
                <span>Category</span>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                  placeholder="Orientation, Social, Academic..."
                />
              </label>

              <div className="admin-form-actions">
                <button type="submit" className="admin-primary-btn">
                  {editingId ? "Save changes" : "Publish event"}
                </button>
                {editingId ? (
                  <button type="button" className="admin-secondary-btn" onClick={resetForm}>
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>
          </div>

          <div className="dashboard-card admin-list-card">
            <div className="admin-section-header">
              <h3>All events</h3>
              <p>{events.length} events currently available on the platform.</p>
            </div>

            <div className="admin-list">
              {events.map((item) => (
                <article className="admin-list-item" key={item.id}>
                  <div>
                    <h4>{item.title}</h4>
                    <p>{item.description || "No description provided."}</p>
                    <div className="admin-meta">
                      <span>{new Date(item.event_date).toLocaleString("en-GB")}</span>
                      <span>{item.location || "Location TBD"}</span>
                      <span>{item.category || "General"}</span>
                    </div>
                  </div>

                  <div className="admin-inline-actions">
                    <button type="button" className="admin-secondary-btn" onClick={() => handleEdit(item)}>
                      Edit
                    </button>
                    <button type="button" className="admin-danger-btn" onClick={() => handleDelete(item.id)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}

export default AdminEventsPage;
