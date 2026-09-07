import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    state: "",
    district: "",
    role: "citizen",

    // Authority verification fields
    department: "",
    designation: "",
    employeeId: "",
  });

  const [agreeTerms, setAgreeTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // ========================================================
  // HANDLE INPUT CHANGE
  // ========================================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  // ========================================================
  // HANDLE ROLE CHANGE
  // ========================================================
  const handleRoleChange = (role) => {
    setFormData((previous) => ({
      ...previous,

      role,

      // Clear authority fields when switching
      // back to citizen
      ...(role === "citizen"
        ? {
            department: "",
            designation: "",
            employeeId: "",
          }
        : {}),
    }));

    setError("");
  };

  // ========================================================
  // HANDLE SUBMIT
  // ========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // ====================================================
    // BASIC REQUIRED FIELDS
    // ====================================================
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.state ||
      !formData.district
    ) {
      setError("Please complete all required fields.");

      return;
    }

    // ====================================================
    // AUTHORITY REQUIRED FIELDS
    // ====================================================
    if (formData.role === "authority") {
      if (
        !formData.department.trim() ||
        !formData.designation.trim() ||
        !formData.employeeId.trim()
      ) {
        setError("Please complete all authority verification fields.");

        return;
      }
    }

    // ====================================================
    // PASSWORD LENGTH
    // ====================================================
    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters.");

      return;
    }

    // ====================================================
    // PASSWORD MATCH
    // ====================================================
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");

      return;
    }

    // ====================================================
    // TERMS
    // ====================================================
    if (!agreeTerms) {
      setError("Please accept the terms and conditions.");

      return;
    }

    try {
      setLoading(true);

      // =================================================
      // PREPARE REQUEST
      // =================================================
      const requestBody = {
        name: formData.name.trim(),

        email: formData.email.toLowerCase().trim(),

        phone: formData.phone.trim(),

        password: formData.password,

        state: formData.state,

        district: formData.district,

        role: formData.role,
      };

      // =================================================
      // ADD AUTHORITY FIELDS ONLY FOR AUTHORITY
      // =================================================
      if (formData.role === "authority") {
        requestBody.department = formData.department.trim();

        requestBody.designation = formData.designation.trim();

        requestBody.employeeId = formData.employeeId.trim();
      }

      // =================================================
      // SEND REQUEST
      // =================================================
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      // =================================================
      // SERVER ERROR
      // =================================================
      if (!response.ok) {
        throw new Error(data.message || "Unable to create account.");
      }

      // =================================================
      // AUTHORITY ACCOUNT
      // =================================================
      if (formData.role === "authority" && data.requiresApproval) {
        setSuccess(
          "Authority account created successfully. Your application is pending admin approval.",
        );

        setTimeout(() => {
          navigate("/login", {
            replace: true,
          });
        }, 2200);

        return;
      }

      // =================================================
      // CITIZEN ACCOUNT
      // =================================================
      setSuccess("Account created successfully. Redirecting to login...");

      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 1800);
    } catch (error) {
      console.error("Signup error:", error);

      setError(error.message || "Unable to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="container-fluid">
        <div className="row min-vh-100 align-items-center justify-content-center">
          <div className="col-12 col-sm-11 col-md-10 col-lg-9 col-xl-8">
            {/* ==================================================
                            BRAND
                        ================================================== */}

            <div className="auth-brand text-center">
              <div className="brand-mark">C</div>

              <h1>CASCADE-NET</h1>

              <p>
                Landslide Risk Monitoring
                <br />& Early Warning System
              </p>
            </div>

            {/* ==================================================
                            SIGNUP CARD
                        ================================================== */}

            <section className="auth-card signup-card">
              <div className="auth-card-header">
                <span className="section-label">ACCOUNT REGISTRATION</span>

                <h2>Create your account</h2>

                <p>
                  Register to monitor risks, receive alerts and report
                  incidents.
                </p>
              </div>

              {/* ==================================================
                                MESSAGES
                            ================================================== */}

              {error && (
                <div className="auth-message auth-message-error" role="alert">
                  <span className="message-icon">!</span>

                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div
                  className="auth-message auth-message-success"
                  role="status"
                >
                  <span className="message-icon">✓</span>

                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* ==================================================
                                    PERSONAL INFORMATION
                                ================================================== */}

                <div className="form-section-title">PERSONAL INFORMATION</div>

                <div className="row g-3">
                  {/* NAME */}

                  <div className="col-12 col-md-6">
                    <label htmlFor="signup-name" className="form-label">
                      Full name
                    </label>

                    <input
                      id="signup-name"
                      type="text"
                      name="name"
                      className="form-control auth-input"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      autoComplete="name"
                      required
                    />
                  </div>

                  {/* PHONE */}

                  <div className="col-12 col-md-6">
                    <label htmlFor="signup-phone" className="form-label">
                      Phone number
                    </label>

                    <input
                      id="signup-phone"
                      type="tel"
                      name="phone"
                      className="form-control auth-input"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      autoComplete="tel"
                      required
                    />
                  </div>

                  {/* EMAIL */}

                  <div className="col-12">
                    <label htmlFor="signup-email" className="form-label">
                      {formData.role === "authority"
                        ? "Official email address"
                        : "Email address"}
                    </label>

                    <input
                      id="signup-email"
                      type="email"
                      name="email"
                      className="form-control auth-input"
                      placeholder={
                        formData.role === "authority"
                          ? "name@official-domain"
                          : "name@example.com"
                      }
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                {/* ==================================================
                                    LOCATION
                                ================================================== */}

                <div className="form-section-title mt-4">
                  MONITORING LOCATION
                </div>

                <div className="row g-3">
                  {/* STATE */}

                  <div className="col-12 col-md-6">
                    <label htmlFor="signup-state" className="form-label">
                      State
                    </label>

                    <select
                      id="signup-state"
                      name="state"
                      className="form-select auth-input"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select state</option>

                      <option value="Arunachal Pradesh">
                        Arunachal Pradesh
                      </option>

                      <option value="Assam">Assam</option>

                      <option value="Manipur">Manipur</option>

                      <option value="Meghalaya">Meghalaya</option>

                      <option value="Mizoram">Mizoram</option>

                      <option value="Nagaland">Nagaland</option>

                      <option value="Sikkim">Sikkim</option>

                      <option value="Tripura">Tripura</option>
                    </select>
                  </div>

                  {/* DISTRICT */}

                  <div className="col-12 col-md-6">
                    <label htmlFor="signup-district" className="form-label">
                      District
                    </label>

                    <input
                      id="signup-district"
                      type="text"
                      name="district"
                      className="form-control auth-input"
                      placeholder="Enter district"
                      value={formData.district}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* ==================================================
                                    ACCOUNT TYPE
                                ================================================== */}

                <div className="form-section-title mt-4">ACCOUNT TYPE</div>

                <div className="role-options">
                  {/* CITIZEN */}

                  <label
                    className={`role-option ${
                      formData.role === "citizen" ? "role-option-active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="citizen"
                      checked={formData.role === "citizen"}
                      onChange={() => handleRoleChange("citizen")}
                    />

                    <div>
                      <strong>Citizen / Community</strong>

                      <span>
                        View local risk, receive alerts and report incidents.
                      </span>
                    </div>
                  </label>

                  {/* AUTHORITY */}

                  <label
                    className={`role-option ${
                      formData.role === "authority" ? "role-option-active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="authority"
                      checked={formData.role === "authority"}
                      onChange={() => handleRoleChange("authority")}
                    />

                    <div>
                      <strong>Disaster Management Authority</strong>

                      <span>
                        Monitor incidents, risk zones and emergency response.
                      </span>
                    </div>
                  </label>
                </div>

                {/* ==================================================
                                    AUTHORITY VERIFICATION
                                ================================================== */}

                {formData.role === "authority" && (
                  <>
                    <div className="form-section-title mt-4">
                      AUTHORITY VERIFICATION
                    </div>

                    <div className="authority-note">
                      <strong>Official authority information required</strong>

                      <span>
                        All fields below are required. Your application will be
                        reviewed and approved by a CASCADE-NET administrator.
                      </span>
                    </div>

                    <div className="row g-3 mt-1">
                      {/* DEPARTMENT */}

                      <div className="col-12 col-md-6">
                        <label
                          htmlFor="signup-department"
                          className="form-label"
                        >
                          Department
                          <span className="text-danger"> *</span>
                        </label>

                        <input
                          id="signup-department"
                          type="text"
                          name="department"
                          className="form-control auth-input"
                          placeholder="Enter department"
                          value={formData.department}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      {/* DESIGNATION */}

                      <div className="col-12 col-md-6">
                        <label
                          htmlFor="signup-designation"
                          className="form-label"
                        >
                          Designation
                          <span className="text-danger"> *</span>
                        </label>

                        <input
                          id="signup-designation"
                          type="text"
                          name="designation"
                          className="form-control auth-input"
                          placeholder="Enter designation"
                          value={formData.designation}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      {/* EMPLOYEE ID */}

                      <div className="col-12">
                        <label
                          htmlFor="signup-employee-id"
                          className="form-label"
                        >
                          Employee / Authority ID
                          <span className="text-danger"> *</span>
                        </label>

                        <input
                          id="signup-employee-id"
                          type="text"
                          name="employeeId"
                          className="form-control auth-input"
                          placeholder="Enter official employee or authority ID"
                          value={formData.employeeId}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* ==================================================
                                    SECURITY
                                ================================================== */}

                <div className="form-section-title mt-4">SECURITY</div>

                <div className="row g-3">
                  {/* PASSWORD */}

                  <div className="col-12 col-md-6">
                    <label htmlFor="signup-password" className="form-label">
                      Password
                    </label>

                    <div className="password-wrapper">
                      <input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        className="form-control auth-input"
                        placeholder="Create password"
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="new-password"
                        required
                      />

                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? "HIDE" : "SHOW"}
                      </button>
                    </div>
                  </div>

                  {/* CONFIRM PASSWORD */}

                  <div className="col-12 col-md-6">
                    <label
                      htmlFor="signup-confirm-password"
                      className="form-label"
                    >
                      Confirm password
                    </label>

                    <div className="password-wrapper">
                      <input
                        id="signup-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        className="form-control auth-input"
                        placeholder="Confirm password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        autoComplete="new-password"
                        required
                      />

                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? "HIDE" : "SHOW"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* ==================================================
                                    TERMS
                                ================================================== */}

                <div className="terms-row mt-4">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                  />

                  <label htmlFor="terms">
                    I agree to the CASCADE-NET terms and acknowledge that
                    submitted incident information may be used for disaster
                    monitoring and response.
                  </label>
                </div>

                {/* ==================================================
                                    SUBMIT
                                ================================================== */}

                <button
                  type="submit"
                  className="auth-submit mt-4"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        aria-hidden="true"
                      />

                      {formData.role === "authority"
                        ? "Submit authority application..."
                        : "Create account"}
                    </>
                  ) : formData.role === "authority" ? (
                    "Submit Application"
                  ) : (
                    "Creating account..."
                  )}
                </button>
              </form>

              {/* ==================================================
                                LOGIN
                            ================================================== */}

              <div className="auth-footer">
                <span>Already have an account?</span>

                <Link to="/login">Sign in</Link>
              </div>
            </section>

            {/* ==================================================
                            SECURITY NOTE
                        ================================================== */}

            <div className="auth-security-note">
              <span className="security-dot"></span>

              <span>Secure operational platform</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Signup;
