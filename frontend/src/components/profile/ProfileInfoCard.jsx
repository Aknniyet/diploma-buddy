import LanguageSelector from "../forms/LanguageSelector";

const PROFILE_SELECT_LABELS = {
  female: "Female",
  male: "Male",
  other: "Other",
  no_preference: "No Preference",
};

function formatSelectValue(value) {
  return PROFILE_SELECT_LABELS[value] || value;
}

function ProfileInfoCard({ profile, formData, isEditing, onChange, onToggleLanguage }) {
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
                <div className="profile-select-wrap">
                  <select name={field.key} className="profile-input profile-select" value={formData[field.key]} onChange={onChange}>
                    {field.options.map((option) => (
                      <option value={option} key={option}>{formatSelectValue(option)}</option>
                    ))}
                  </select>
                  <span className="profile-select-arrow">v</span>
                </div>
              ) : (
                <input name={field.key} className="profile-input" value={formData[field.key]} onChange={onChange} />
              )
            ) : (
              <div className="profile-field-box">
                {field.value ? (field.type === "select" ? formatSelectValue(field.value) : field.value) : "Not provided"}
              </div>
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
              ) : section.type === "languages" ? (
                <LanguageSelector
                  selectedLanguages={formData.languages}
                  onToggle={onToggleLanguage}
                  helperText="Choose up to five real languages from the list."
                  emptyText="No languages selected yet."
                  selectPlaceholder="Select languages"
                  searchPlaceholder="Search languages..."
                  triggerClassName="profile-input profile-select"
                />
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
