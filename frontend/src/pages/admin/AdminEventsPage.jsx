import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import CommunityDeleteModal from "../../components/community/CommunityDeleteModal";
import { apiRequest } from "../../lib/api";
import { formatAstanaDateTime, toAstanaDateTimeInputValue } from "../../utils/datetime";
import "../../styles/admin.css";

const initialForm = {
  title: "",
  description: "",
  eventDate: "",
  location: "",
  category: "",
  imageUrl: "",
};

function formatInputDate(dateValue) {
  return toAstanaDateTimeInputValue(dateValue);
}

function AdminEventsPage() {
  const [events, setEvents] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);
  const isSubmittingRef = useRef(false);

  const loadEvents = async () => {
    try {
      const data = await apiRequest("/events");
      setEvents(Array.isArray(data) ? data : []);
      setLoadError("");
    } catch (error) {
      setEvents([]);
      setLoadError(error.message || "Could not load events.");
    }
  };

  useEffect(() => {
    loadEvents().catch(() => null);
  }, []);

  const itemsPerPage = 3;
  const totalPages = Math.max(1, Math.ceil(events.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedEvents = useMemo(
    () =>
      events.slice(
        (safePage - 1) * itemsPerPage,
        safePage * itemsPerPage
      ),
    [events, safePage]
  );

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const readImageFile = (file, onLoad) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setStatusType("error");
      setStatus("Please choose an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onLoad(reader.result);
      setStatus("");
      setStatusType("info");
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    readImageFile(file, (imageUrl) => {
      setForm((current) => ({ ...current, imageUrl }));
    });
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmittingRef.current) {
      return;
    }

    const isEditing = Boolean(editingId);
    const endpoint = isEditing ? `/events/${editingId}` : "/events";
    const method = isEditing ? "PATCH" : "POST";

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setStatusType("info");
    setStatus(isEditing ? "Saving changes..." : "Publishing event...");

    try {
      await apiRequest(endpoint, {
        method,
        body: JSON.stringify({
          ...form,
          eventDate: form.eventDate,
        }),
      });

      setStatusType("success");
      setStatus(isEditing ? "Event updated successfully." : "Event published successfully.");
      resetForm();
      await loadEvents();
    } catch (error) {
      setStatusType("error");
      setStatus(error.message || "Could not save the event.");
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title || "",
      description: item.description || "",
      eventDate: formatInputDate(item.event_date),
      location: item.location || "",
      category: item.category || "",
      imageUrl: item.image_url || "",
    });
    setStatus("");
    setStatusType("info");
  };

  const openDeleteModal = (item) => {
    setEventToDelete(item);
    setDeleteError("");
  };

  const closeDeleteModal = () => {
    if (isDeletingEvent) return;
    setEventToDelete(null);
    setDeleteError("");
  };

  const handleDelete = async () => {
    if (!eventToDelete) return;

    setDeleteError("");
    setIsDeletingEvent(true);

    try {
      await apiRequest(`/events/${eventToDelete.id}`, { method: "DELETE" });
      setStatusType("success");
      setStatus("Event deleted.");
      if (editingId === eventToDelete.id) {
        resetForm();
      }
      setEventToDelete(null);
      await loadEvents();
    } catch (error) {
      setDeleteError(error.message || "Could not delete the event.");
    } finally {
      setIsDeletingEvent(false);
    }
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

            {status ? (
              <div className={`admin-status${statusType === "error" ? " admin-error" : ""}`}>
                {status}
              </div>
            ) : null}

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

              <div className="admin-image-field">
                <span>Event image</span>
                {form.imageUrl ? (
                  <div className="admin-image-preview">
                    <img src={form.imageUrl} alt="Event preview" />
                    <button
                      type="button"
                      className="admin-image-remove"
                      onClick={() => setForm((prev) => ({ ...prev, imageUrl: "" }))}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="admin-image-upload">
                    <ImagePlus size={16} />
                    Add image
                    <input type="file" accept="image/*" onChange={handleImageChange} />
                  </label>
                )}
              </div>

              <div className="admin-form-actions">
                <button type="submit" className="admin-primary-btn" disabled={isSubmitting}>
                  {isSubmitting
                    ? editingId
                      ? "Saving..."
                      : "Publishing..."
                    : editingId
                      ? "Save changes"
                      : "Publish event"}
                </button>
                {editingId ? (
                  <button
                    type="button"
                    className="admin-secondary-btn"
                    onClick={resetForm}
                    disabled={isSubmitting}
                  >
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
              {loadError ? (
                <div className="admin-empty-state">{loadError}</div>
              ) : paginatedEvents.length === 0 ? (
                <div className="admin-empty-state">No events published yet.</div>
              ) : (
                paginatedEvents.map((item) => (
                  <article className="admin-list-item" key={item.id}>
                    <div className="admin-item-main">
                      <div className="admin-event-row">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.title} className="admin-event-thumb" />
                        ) : null}
                        <div className="admin-event-copy">
                          <h4>{item.title}</h4>
                          <p>{item.description || "No description provided."}</p>
                        </div>
                      </div>
                      <div className="admin-meta">
                        <span>{formatAstanaDateTime(item.event_date)}</span>
                        <span>{item.location || "Location TBD"}</span>
                        <span>{item.category || "General"}</span>
                      </div>
                    </div>

                    <div className="admin-inline-actions">
                      <button type="button" className="admin-secondary-btn" onClick={() => handleEdit(item)}>
                        Edit
                      </button>
                      <button type="button" className="admin-danger-btn" onClick={() => openDeleteModal(item)}>
                        Delete
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>

            <div className="admin-pagination">
              <button
                type="button"
                className="admin-page-btn"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={safePage === 1}
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  className={`admin-page-btn ${safePage === page ? "active" : ""}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                className="admin-page-btn"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={safePage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>

      {eventToDelete ? (
        <CommunityDeleteModal
          deleteError={deleteError}
          isDeletingPost={isDeletingEvent}
          onCancel={closeDeleteModal}
          onConfirm={handleDelete}
          title="Delete event?"
          description={`Are you sure you want to delete "${eventToDelete.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          deletingLabel="Deleting..."
        />
      ) : null}
    </DashboardLayout>
  );
}

export default AdminEventsPage;
