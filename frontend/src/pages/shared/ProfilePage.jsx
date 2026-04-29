import { useEffect, useMemo, useState } from "react";
import { BookOpen, Heart, Languages, MapPin, UserRound } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import ProfilePageHeader from "../../components/profile/ProfilePageHeader";
import ProfileSummaryCard from "../../components/profile/ProfileSummaryCard";
import ProfileInfoCard from "../../components/profile/ProfileInfoCard";
import { apiRequest } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import "../../styles/profile.css";

function ProfilePage({ userType = "student" }) {
  const isBuddy = userType === "buddy";
  const { refreshUser } = useAuth();
  const [rawProfile, setRawProfile] = useState(null);
  const [formData, setFormData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadProfile = async () => {
    const profile = await apiRequest("/profile/me");
    setRawProfile(profile);
    setFormData({
      fullName: profile.full_name || "",
      email: profile.email || "",
      homeCountry: profile.home_country || "",
      city: profile.city || "",
      studyProgram: profile.study_program || "",
      gender: profile.gender || "",
      genderPreference: profile.gender_preference || "no_preference",
      languages: (profile.languages || []).join(", "),
      hobbies: (profile.hobbies || []).join(", "),
      aboutYou: profile.about_you || "",
      profilePhotoUrl: profile.profile_photo_url || "",
      maxBuddies: String(profile.max_buddies || 3),
    });
  };

  useEffect(() => {
    loadProfile().catch(() => null);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please choose an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, profilePhotoUrl: reader.result }));
      setMessage("");
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoRemove = () => {
    setFormData((prev) => ({ ...prev, profilePhotoUrl: "" }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage("");
    try {
      const result = await apiRequest("/profile/me", {
        method: "PUT",
        body: JSON.stringify(formData),
      });
      setRawProfile(result.profile);
      setIsEditing(false);
      setMessage(result.message);
      await refreshUser();
      await loadProfile();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const profile = useMemo(() => {
    if (!rawProfile) return null;

    return {
      fullName: rawProfile.full_name,
      role: rawProfile.role === "local" ? "Buddy" : "International Student",
      email: rawProfile.email,
      avatar: rawProfile.profile_photo_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      summaryItems: [
        { id: 1, icon: MapPin, label: isBuddy ? "City:" : "From:", value: rawProfile.home_country || rawProfile.city || "Not provided" },
        { id: 2, icon: MapPin, label: "Living in:", value: rawProfile.city || "Not provided" },
        { id: 3, icon: BookOpen, label: "Program:", value: rawProfile.study_program || "Not provided" },
      ],
      fields: [
        { id: 1, label: "Full Name", key: "fullName", value: rawProfile.full_name || "" },
        { id: 2, label: "Email", key: "email", value: rawProfile.email || "" , disabled: true},
        { id: 3, label: "Home Country", key: "homeCountry", value: rawProfile.home_country || "" },
        { id: 4, label: "Current City", key: "city", value: rawProfile.city || "" },
        { id: 5, label: "Study Program", key: "studyProgram", value: rawProfile.study_program || "" },
        { id: 6, label: "Gender", key: "gender", value: rawProfile.gender || "" , type: "select", options: ["female", "male", "other"]},
        { id: 7, label: "Buddy Preference", key: "genderPreference", value: rawProfile.gender_preference || "no_preference", type: "select", options: ["no_preference", "female", "male", "other"] },
        ...(isBuddy
          ? [
              {
                id: 8,
                label: "Maximum Students",
                key: "maxBuddies",
                value: String(rawProfile.max_buddies || 3),
                type: "select",
                options: ["1", "2", "3"],
              },
            ]
          : []),
      ],
      sections: [
        {
          id: 1,
          title: "Languages Spoken",
          icon: Languages,
          type: "filled",
          key: "languages",
          items: rawProfile.languages?.length ? rawProfile.languages : ["Not provided"],
        },
        {
          id: 2,
          title: "Hobbies & Interests",
          icon: Heart,
          type: "outline",
          key: "hobbies",
          items: rawProfile.hobbies?.length ? rawProfile.hobbies : ["Not provided"],
        },
        {
          id: 3,
          title: "About You",
          icon: UserRound,
          type: "text",
          key: "aboutYou",
          text: rawProfile.about_you || "No bio yet.",
        },
      ],
    };
  }, [isBuddy, rawProfile]);

  const displayProfile = useMemo(() => {
    if (!profile || !formData) return profile;

    return {
      ...profile,
      avatar: formData.profilePhotoUrl || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    };
  }, [formData, profile]);

  return (
    <DashboardLayout title="Profile" sidebarType={isBuddy ? "buddy" : "student"}>
      <section className="profile-page">
        <div className="profile-page-top">
          <ProfilePageHeader />
          <div className="profile-page-actions">
            {isEditing ? (
              <>
                <button type="button" className="profile-cancel-btn" onClick={() => { setIsEditing(false); setMessage(""); loadProfile().catch(() => null); }}>
                  Cancel
                </button>
                <button type="button" className="edit-profile-btn" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </>
            ) : (
              <button type="button" className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                Edit Profile
              </button>
            )}
          </div>
        </div>
        {message ? <div className="profile-status-message">{message}</div> : null}
        {profile && formData ? (
          <div className="profile-layout">
            <ProfileSummaryCard
              profile={displayProfile}
              isEditing={isEditing}
              onPhotoChange={handlePhotoChange}
              onPhotoRemove={handlePhotoRemove}
            />
            <ProfileInfoCard profile={profile} formData={formData} isEditing={isEditing} onChange={handleChange} />
          </div>
        ) : (
          <div className="dashboard-card"><p>Loading profile...</p></div>
        )}
      </section>
    </DashboardLayout>
  );
}

export default ProfilePage;
