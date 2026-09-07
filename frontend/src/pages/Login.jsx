import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid email or password.");
      }

      // =================================
      // SAVE LOGIN STATE
      // =================================

      localStorage.setItem("token", data.token);

      localStorage.setItem("user", JSON.stringify(data.user));

      // =================================
      // ROLE-BASED NAVIGATION
      // =================================

      if (data.user.role === "admin") {
        navigate("/admin", {
          replace: true,
        });
      } else if (data.user.role === "authority") {
        navigate("/command-center", {
          replace: true,
        });
      } else {
        navigate("/dashboard", {
          replace: true,
        });
      }
    } catch (error) {
      setError(error.message || "Unable to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="container-fluid">
        <div className="row min-vh-100 align-items-center justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
            {/* Brand */}
            <div className="auth-brand text-center">
              <div className="brand-mark">C</div>

              <h1>CASCADE-NET</h1>

              <p>
                Landslide Risk Monitoring
                <br />
                &amp; Early Warning System
              </p>
            </div>

            {/* Login Card */}
            <section className="auth-card">
              <div className="auth-card-header">
                <span className="section-label">SECURE ACCESS</span>

                <h2>Welcome back</h2>

                <p>Sign in to access your disaster monitoring dashboard.</p>
              </div>

              {/* Error */}
              {error && (
                <div className="auth-message auth-message-error" role="alert">
                  <span className="message-icon">!</span>

                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Email */}
                <div className="mb-3">
                  <label htmlFor="login-email" className="form-label">
                    Email address
                  </label>

                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    className="form-control auth-input"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />
                </div>

                {/* Password */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <label htmlFor="login-password" className="form-label">
                      Password
                    </label>

                    <button type="button" className="text-button">
                      Forgot password?
                    </button>
                  </div>

                  <div className="password-wrapper">
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className="form-control auth-input"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="current-password"
                      required
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? "HIDE" : "SHOW"}
                    </button>
                  </div>
                </div>

                {/* Persistent Login Information */}
                <div className="remember-row mb-4">
                  <span>You will remain signed in until you log out.</span>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="auth-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        aria-hidden="true"
                      />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="auth-divider">
                <span>NEW TO CASCADE-NET?</span>
              </div>

              <Link to="/signup" className="secondary-auth-button">
                Create an account
              </Link>
            </section>

            {/* Security Footer */}
            <div className="auth-security-note">
              <span className="security-dot"></span>

              <span>Protected operational access</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Login;
