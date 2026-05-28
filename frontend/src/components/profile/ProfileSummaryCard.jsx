import { Camera, Trash2 } from "lucide-react";

function ProfileSummaryCard({
  profile,
  isEditing = false,
  onPhotoChange = () => {},
  onPhotoRemove = () => {},
}) {
  return (
    <div className="profile-summary-card">
      <div className="profile-summary-top">
        <div className="profile-avatar-wrap">
          <img
            src={profile.avatar}
            alt={profile.fullName}
            className="profile-avatar"
          />

          {isEditing ? (
            <label className="profile-photo-upload">
              <Camera size={16} />
              Change photo
              <input type="file" accept="image/*" onChange={onPhotoChange} />
            </label>
          ) : null}
        </div>

        {isEditing ? (
          <button type="button" className="profile-remove-photo" onClick={onPhotoRemove}>
            <Trash2 size={15} />
            Remove photo
          </button>
        ) : null}

        <h2>{profile.fullName}</h2>

        <span className="profile-role-badge">{profile.role}</span>

        <p className="profile-email">{profile.email}</p>
      </div>

      <div className="profile-divider" />

      <div className="profile-summary-list">
        {profile.summaryItems.map((item) => {
          const Icon = item.icon;

          return (
            <div className="profile-summary-item" key={item.id}>
              <Icon size={18} />
              <span className="summary-label">{item.label}</span>
              <span className="summary-value">{item.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProfileSummaryCard;
