function ProfileInfoCard({ profile, formData, isEditing, onChange }) {
  return (
    <div className="profile-info-card">
      <div className="profile-info-header">
        <h3>Profile Information</h3>
        <p>Your profile helps buddies get to know you better</p>
      </div>

      <div className="profile-info-grid">
        {profile.fields.map((field) => (
          <div className="profile-field" key={field.id}>
            <label>{field.label}</label>
            {isEditing && !field.disabled ? (
              field.type === "select" ? (
                <select name={field.key} className="profile-input" value={formData[field.key]} onChange={onChange}>
                  {field.options.map((option) => (
                    <option value={option} key={option}>{option === "no_preference" ? "No preference" : option}</option>
                  ))}
                </select>
              ) : (
                <input name={field.key} className="profile-input" value={formData[field.key]} onChange={onChange} />
              )
            ) : (
              <div className="profile-field-box">{field.value || "Not provided"}</div>
            )}
          </div>
        ))}
      </div>

      {profile.sections.map((section) => {
        const Icon = section.icon;
        return (
          <div className="profile-tags-section" key={section.id}>
            <div className="profile-tags-title">
              <Icon size={18} />
              <span>{section.title}</span>
            </div>
            {isEditing ? (
              section.type === "text" ? (
                <textarea className="profile-textarea" name={section.key} value={formData[section.key]} onChange={onChange} rows={4} />
              ) : (
                <input className="profile-input" name={section.key} value={formData[section.key]} onChange={onChange} placeholder="Separate items with commas" />
              )
            ) : section.type === "text" ? (
              <div className="profile-about-box">{section.text}</div>
            ) : (
              <div className="profile-tags">
                {section.items.map((item) => (
                  <span className={section.type === "outline" ? "profile-tag outline" : "profile-tag"} key={item}>
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ProfileInfoCard;
