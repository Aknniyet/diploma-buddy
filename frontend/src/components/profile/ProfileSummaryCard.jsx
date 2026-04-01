function ProfileSummaryCard({ profile }) {
  return (
    <div className="profile-summary-card">
      <div className="profile-summary-top">
        <img
          src={profile.avatar}
          alt={profile.fullName}
          className="profile-avatar"
        />

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