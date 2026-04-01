import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Globe, MapPin, Users, ChevronLeft, ChevronRight } from "lucide-react";
import "../../styles/signup.css";
import { apiRequest } from "../../lib/api";

function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    homeCountry: "",
    city: "",
    studyProgram: "",
    languages: "",
    hobbies: "",
    aboutYou: "",
    gender: "",
    genderPreference: "no_preference",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    setError("");
    if (step === 1 && !selectedRole) return setError("Please choose your role first.");
    if (step === 2 && (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword)) {
      return setError("Please fill in full name, email, password and confirm password.");
    }
    if (step === 2 && formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match.");
    }
    if (step < 3) setStep((prev) => prev + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({ role: selectedRole, ...formData }),
      });
      navigate("/login", { replace: true, state: { registeredEmail: formData.email } });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-wrapper">
        <Link to="/" className="signup-brand">
          <div className="signup-brand-icon"><Users size={22} /></div>
          <h1>KazakhBuddy</h1>
        </Link>

        <div className="signup-card">
          <h2>Create Your Account</h2>
          <p className="signup-step-text">Step {step} of 3</p>
          <div className="signup-progress">
            <span className={step >= 1 ? "active" : ""}></span>
            <span className={step >= 2 ? "active" : ""}></span>
            <span className={step >= 3 ? "active" : ""}></span>
          </div>

          <form onSubmit={handleSubmit} className="signup-form">
            {step === 1 && (
              <div className="signup-step-content">
                <p className="signup-section-label">I am...</p>
                <div className="role-grid">
                  <button type="button" className={`role-card ${selectedRole === "international" ? "selected" : ""}`} onClick={() => setSelectedRole("international")}>
                    <div className="role-icon"><Globe size={28} /></div>
                    <h3>International Student</h3>
                    <p>Looking for a local buddy</p>
                  </button>
                  <button type="button" className={`role-card ${selectedRole === "local" ? "selected" : ""}`} onClick={() => setSelectedRole("local")}>
                    <div className="role-icon"><MapPin size={28} /></div>
                    <h3>Buddy</h3>
                    <p>Want to support international students</p>
                  </button>
                </div>
                {error && <p className="signup-error-text">{error}</p>}
                <button type="button" className="signup-primary-btn full-width" onClick={handleNext}>Continue<ChevronRight size={18} /></button>
              </div>
            )}

            {step === 2 && (
              <div className="signup-step-content">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Ivanov Ivan"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="email@university.edu"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    type="password" 
                    placeholder="Confirm your password" 
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="gender">Gender</label>
                  <select id="gender" className="signup-select" name="gender" value={formData.gender} onChange={handleChange}>
                    <option value="">Select gender</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                  <small>This helps the system respect buddy preferences.</small>
                </div>

                {selectedRole === "international" && (
                  <div className="form-group">
                    <label htmlFor="genderPreference">Buddy Gender Preference</label>
                    <select id="genderPreference" className="signup-select" name="genderPreference" value={formData.genderPreference} onChange={handleChange}>
                      <option value="no_preference">No preference</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="other">Other</option>
                    </select>
                    <small>You can keep it flexible or choose a preference.</small>
                  </div>
                )}

                {error && <p className="signup-error-text">{error}</p>}

                <div className="signup-buttons-row">
                  <button type="button" className="signup-secondary-btn" onClick={() => setStep(1)}>
                    <ChevronLeft size={18} />Back
                  </button>
                  <button type="button" className="signup-primary-btn" onClick={handleNext}>
                    Continue<ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="signup-step-content">
                <div className="form-group">
                  <label htmlFor="homeCountry">Home Country</label>
                  <input 
                    id="homeCountry" 
                    name="homeCountry" 
                    type="text" 
                    placeholder="e.g., Japan, Brazil"
                    value={formData.homeCountry} 
                    onChange={handleChange} 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="city">Current City</label>
                  <input 
                    id="city" 
                    name="city" 
                    type="text" 
                    placeholder="e.g., Almaty, Astana"
                    value={formData.city} 
                    onChange={handleChange} 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="studyProgram">Study Program</label>
                  <input 
                    id="studyProgram" 
                    name="studyProgram" 
                    type="text" 
                    placeholder="e.g., Computer Science, Business"
                    value={formData.studyProgram} 
                    onChange={handleChange} 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="languages">Languages</label>
                  <input 
                    id="languages" 
                    name="languages" 
                    type="text" 
                    placeholder="e.g., English, German" 
                    value={formData.languages} 
                    onChange={handleChange} 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="hobbies">Interests</label>
                  <input 
                    id="hobbies" 
                    name="hobbies" 
                    type="text" 
                    placeholder="e.g., Hiking, Photography, Gaming" 
                    value={formData.hobbies} 
                    onChange={handleChange} 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="aboutYou">About You</label>
                  <textarea 
                    id="aboutYou" 
                    name="aboutYou" 
                    rows="4" 
                    placeholder="Tell us a bit about yourself so your future buddy understands you better..."
                    value={formData.aboutYou} 
                    onChange={handleChange} 
                  />
                </div>

                {error && <p className="signup-error-text">{error}</p>}

                <div className="signup-buttons-row">
                  <button type="button" className="signup-secondary-btn" onClick={() => setStep(2)}>
                    <ChevronLeft size={18} />Back
                  </button>
                  <button type="submit" className="signup-primary-btn" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create Account"}
                  </button>
                </div>
              </div>
            )}
          </form>

          <p className="signup-footer-text">Already have an account? <Link to="/login">Log in</Link></p>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;