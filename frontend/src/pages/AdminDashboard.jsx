import { useCallback, useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000/api";

const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem("user");

    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

function AdminDashboard() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const storedUser = getStoredUser();

  const userId = storedUser?.id || storedUser?._id || "";

  const userRole = storedUser?.role || "";

  const userName = storedUser?.name || "Administrator";

  // =================================================
  // STATE
  // =================================================

  const [stats, setStats] = useState({
    totalCitizens: 0,
    totalAuthorities: 0,
    pendingAuthorities: 0,
    verifiedAuthorities: 0,
    rejectedAuthorities: 0,
  });

  const [pendingAuthorities, setPendingAuthorities] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [actionLoading, setActionLoading] = useState(null);

  const [error, setError] = useState("");

  const [selectedAuthority, setSelectedAuthority] = useState(null);

  const [showRejectModal, setShowRejectModal] = useState(false);

  const [rejectionReason, setRejectionReason] = useState("");

  // =================================================
  // LOAD ADMIN DATA
  // =================================================

  const loadAdminData = useCallback(
    async (isRefresh = false) => {
      if (!token) {
        navigate("/login", {
          replace: true,
        });

        return;
      }

      if (userRole !== "admin") {
        navigate("/login", {
          replace: true,
        });

        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [statsResponse, pendingResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/admin/stats`, {
            method: "GET",
            headers,
          }),

          fetch(`${API_BASE_URL}/admin/authorities/pending`, {
            method: "GET",
            headers,
          }),
        ]);

        let statsData = {};

        let pendingData = {};

        try {
          statsData = await statsResponse.json();
        } catch {
          statsData = {};
        }

        try {
          pendingData = await pendingResponse.json();
        } catch {
          pendingData = {};
        }

        // =========================================
        // AUTH FAILURE
        // =========================================

        if (statsResponse.status === 401 || pendingResponse.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          navigate("/login", {
            replace: true,
          });

          return;
        }

        // =========================================
        // PERMISSION FAILURE
        // =========================================

        if (statsResponse.status === 403 || pendingResponse.status === 403) {
          throw new Error(
            "You are not authorized to access the Admin Dashboard.",
          );
        }

        // =========================================
        // STATS ERROR
        // =========================================

        if (!statsResponse.ok) {
          throw new Error(
            statsData.message || "Unable to load admin statistics.",
          );
        }

        // =========================================
        // PENDING ERROR
        // =========================================

        if (!pendingResponse.ok) {
          throw new Error(
            pendingData.message || "Unable to load pending authorities.",
          );
        }

        // =========================================
        // UPDATE STATE
        // =========================================

        setStats(statsData.stats || statsData || {});

        setPendingAuthorities(
          Array.isArray(pendingData.authorities) ? pendingData.authorities : [],
        );
      } catch (err) {
        console.error("Admin dashboard error:", err);

        setError(err.message || "Unable to load admin dashboard.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, userRole, navigate],
  );

  // =================================================
  // INITIAL LOAD
  // =================================================

  useEffect(() => {
    if (!token || !userId || userRole !== "admin") {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    loadAdminData(false);
  }, [token, userId, userRole, loadAdminData, navigate]);

  // =================================================
  // APPROVE AUTHORITY
  // =================================================

  const handleApprove = async (authorityId) => {
    if (!authorityId) {
      return;
    }

    try {
      setActionLoading(authorityId);

      setError("");

      const response = await fetch(
        `${API_BASE_URL}/admin/authorities/${authorityId}/approve`,
        {
          method: "PATCH",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login", {
          replace: true,
        });

        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to approve authority.");
      }

      setSelectedAuthority(null);

      await loadAdminData(true);
    } catch (err) {
      console.error("Approve authority error:", err);

      setError(err.message || "Unable to approve authority.");
    } finally {
      setActionLoading(null);
    }
  };

  // =================================================
  // OPEN REJECT MODAL
  // =================================================

  const openRejectModal = (authority) => {
    setSelectedAuthority(authority);

    setRejectionReason("");

    setError("");

    setShowRejectModal(true);
  };

  // =================================================
  // CLOSE REJECT MODAL
  // =================================================

  const closeRejectModal = () => {
    setShowRejectModal(false);

    setSelectedAuthority(null);

    setRejectionReason("");
  };

  // =================================================
  // REJECT AUTHORITY
  // =================================================

  const handleReject = async () => {
    if (!selectedAuthority) {
      return;
    }

    if (!rejectionReason.trim()) {
      setError("Please enter a rejection reason.");

      return;
    }

    const authorityId = selectedAuthority._id;

    try {
      setActionLoading(authorityId);

      setError("");

      const response = await fetch(
        `${API_BASE_URL}/admin/authorities/${authorityId}/reject`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            reason: rejectionReason.trim(),
          }),
        },
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login", {
          replace: true,
        });

        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to reject authority.");
      }

      closeRejectModal();

      await loadAdminData(true);
    } catch (err) {
      console.error("Reject authority error:", err);

      setError(err.message || "Unable to reject authority.");
    } finally {
      setActionLoading(null);
    }
  };

  // =================================================
  // LOGOUT
  // =================================================

  const handleLogout = () => {
    localStorage.removeItem("token");

    localStorage.removeItem("user");

    navigate("/login", {
      replace: true,
    });
  };

  // =================================================
  // LOADING
  // =================================================

  if (loading) {
    return (
      <main className="cascade-dashboard-page">
        <div className="container-fluid px-3 px-md-4 py-4">
          <div className="cascade-loading-panel">
            <div className="spinner-border cascade-spinner" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>

            <p className="cascade-secondary-text mb-0 mt-3">
              Loading Admin Dashboard...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // =================================================
  // UI
  // =================================================

  return (
    <main className="cascade-dashboard-page">
      <div className="container-fluid px-3 px-md-4 py-3 py-md-4">
        {/* =====================================
                    HEADER
                ====================================== */}

        <header className="cascade-page-header mb-4">
          <div className="row align-items-center g-3">
            <div className="col-12 col-lg">
              <div className="cascade-eyebrow">CASCADE-NET</div>

              <h1 className="cascade-page-title">Admin Control Center</h1>

              <p className="cascade-secondary-text mb-0">
                Authority verification and system administration
              </p>
            </div>

            <div className="col-12 col-lg-auto">
              <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
                <div className="cascade-user-panel">
                  <div className="cascade-user-name">{userName}</div>

                  <div className="cascade-muted-text">System Administrator</div>
                </div>

                <button
                  type="button"
                  className="btn cascade-btn-danger"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* =====================================
                    ERROR
                ====================================== */}

        {error && (
          <div className="cascade-alert cascade-alert-danger mb-4" role="alert">
            <div>
              <strong>Administration Error</strong>

              <div>{error}</div>
            </div>

            <button
              type="button"
              className="cascade-alert-close"
              aria-label="Close"
              onClick={() => setError("")}
            >
              ×
            </button>
          </div>
        )}

        {/* =====================================
                    STATISTICS
                ====================================== */}

        <section
          className="row g-3 mb-4"
          aria-label="Administration statistics"
        >
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="cascade-stat-card cascade-stat-warning h-100">
              <div className="cascade-stat-label">Pending Authorities</div>

              <div className="cascade-stat-value">
                {stats.pendingAuthorities ?? 0}
              </div>

              <div className="cascade-stat-meta">Awaiting verification</div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="cascade-stat-card cascade-stat-active h-100">
              <div className="cascade-stat-label">Verified Authorities</div>

              <div className="cascade-stat-value">
                {stats.verifiedAuthorities ?? 0}
              </div>

              <div className="cascade-stat-meta">
                Operational access granted
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="cascade-stat-card cascade-stat-critical h-100">
              <div className="cascade-stat-label">Rejected Applications</div>

              <div className="cascade-stat-value">
                {stats.rejectedAuthorities ?? 0}
              </div>

              <div className="cascade-stat-meta">Verification unsuccessful</div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="cascade-stat-card cascade-stat-info h-100">
              <div className="cascade-stat-label">Total Citizens</div>

              <div className="cascade-stat-value">
                {stats.totalCitizens ?? 0}
              </div>

              <div className="cascade-stat-meta">
                Registered citizen accounts
              </div>
            </div>
          </div>
        </section>

        {/* =====================================
                    AUTHORITY REQUESTS
                ====================================== */}

        <section className="cascade-panel">
          <div className="cascade-panel-header">
            <div>
              <div className="cascade-section-eyebrow">ACCESS CONTROL</div>

              <h2 className="cascade-section-title">
                Authority Verification Requests
              </h2>

              <p className="cascade-secondary-text mb-0">
                Review authority applications before granting Command Center
                access.
              </p>
            </div>

            <button
              type="button"
              className="btn cascade-btn-neutral"
              disabled={refreshing}
              onClick={() => loadAdminData(true)}
            >
              {refreshing ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    aria-hidden="true"
                  />
                  Refreshing
                </>
              ) : (
                "Refresh"
              )}
            </button>
          </div>

          <div className="cascade-panel-body">
            {pendingAuthorities.length === 0 ? (
              <div className="cascade-empty-state">
                <div className="cascade-empty-icon">✓</div>

                <h3 className="cascade-empty-title">No Pending Applications</h3>

                <p className="cascade-secondary-text mb-0">
                  There are currently no authority accounts waiting for
                  approval.
                </p>
              </div>
            ) : (
              <div className="row g-3">
                {pendingAuthorities.map((authority) => (
                  <div className="col-12 col-xl-6" key={authority._id}>
                    <article className="cascade-authority-card h-100">
                      {/* HEADER */}

                      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start gap-3 mb-3">
                        <div>
                          <h3 className="cascade-card-title">
                            {authority.name || "Unnamed Authority"}
                          </h3>

                          <span className="cascade-badge cascade-status-warning">
                            Pending Verification
                          </span>
                        </div>
                      </div>

                      {/* DETAILS */}

                      <div className="row g-2 mb-3">
                        <div className="col-12 col-md-6">
                          <div className="cascade-info-item">
                            <span className="cascade-info-label">
                              Department
                            </span>

                            <span className="cascade-info-value">
                              {authority.department || "—"}
                            </span>
                          </div>
                        </div>

                        <div className="col-12 col-md-6">
                          <div className="cascade-info-item">
                            <span className="cascade-info-label">
                              Designation
                            </span>

                            <span className="cascade-info-value">
                              {authority.designation || "—"}
                            </span>
                          </div>
                        </div>

                        <div className="col-12 col-md-6">
                          <div className="cascade-info-item">
                            <span className="cascade-info-label">
                              Employee ID
                            </span>

                            <span className="cascade-info-value">
                              {authority.employeeId || "—"}
                            </span>
                          </div>
                        </div>

                        <div className="col-12 col-md-6">
                          <div className="cascade-info-item">
                            <span className="cascade-info-label">Email</span>

                            <span className="cascade-info-value cascade-break-word">
                              {authority.email || "—"}
                            </span>
                          </div>
                        </div>

                        <div className="col-12 col-md-6">
                          <div className="cascade-info-item">
                            <span className="cascade-info-label">Phone</span>

                            <span className="cascade-info-value">
                              {authority.phone || "—"}
                            </span>
                          </div>
                        </div>

                        <div className="col-12 col-md-6">
                          <div className="cascade-info-item">
                            <span className="cascade-info-label">Location</span>

                            <span className="cascade-info-value">
                              {authority.location?.state || "—"}

                              {" • "}

                              {authority.location?.district || "—"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* ACTIONS */}

                      <div className="d-flex flex-column flex-sm-row gap-2">
                        <button
                          type="button"
                          className="btn cascade-btn-neutral flex-fill"
                          onClick={() => setSelectedAuthority(authority)}
                        >
                          View Details
                        </button>

                        <button
                          type="button"
                          className="btn cascade-btn-success flex-fill"
                          disabled={actionLoading === authority._id}
                          onClick={() => handleApprove(authority._id)}
                        >
                          {actionLoading === authority._id
                            ? "Processing..."
                            : "Approve"}
                        </button>

                        <button
                          type="button"
                          className="btn cascade-btn-danger flex-fill"
                          disabled={actionLoading === authority._id}
                          onClick={() => openRejectModal(authority)}
                        >
                          Reject
                        </button>
                      </div>
                    </article>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* =========================================
                DETAILS MODAL
            ========================================== */}

      {selectedAuthority && !showRejectModal && (
        <div
          className="cascade-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="authorityDetailsTitle"
        >
          <div className="cascade-modal-dialog">
            <div className="cascade-modal">
              <div className="cascade-modal-header">
                <div>
                  <div className="cascade-section-eyebrow">
                    AUTHORITY REVIEW
                  </div>

                  <h2
                    id="authorityDetailsTitle"
                    className="cascade-modal-title"
                  >
                    Application Details
                  </h2>
                </div>

                <button
                  type="button"
                  className="cascade-modal-close"
                  aria-label="Close"
                  onClick={() => setSelectedAuthority(null)}
                >
                  ×
                </button>
              </div>

              <div className="cascade-modal-body">
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <div className="cascade-detail-block">
                      <span className="cascade-info-label">Full Name</span>

                      <span className="cascade-info-value">
                        {selectedAuthority.name || "—"}
                      </span>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="cascade-detail-block">
                      <span className="cascade-info-label">Email</span>

                      <span className="cascade-info-value cascade-break-word">
                        {selectedAuthority.email || "—"}
                      </span>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="cascade-detail-block">
                      <span className="cascade-info-label">Phone</span>

                      <span className="cascade-info-value">
                        {selectedAuthority.phone || "—"}
                      </span>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="cascade-detail-block">
                      <span className="cascade-info-label">Department</span>

                      <span className="cascade-info-value">
                        {selectedAuthority.department || "—"}
                      </span>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="cascade-detail-block">
                      <span className="cascade-info-label">Designation</span>

                      <span className="cascade-info-value">
                        {selectedAuthority.designation || "—"}
                      </span>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="cascade-detail-block">
                      <span className="cascade-info-label">Employee ID</span>

                      <span className="cascade-info-value">
                        {selectedAuthority.employeeId || "—"}
                      </span>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="cascade-detail-block">
                      <span className="cascade-info-label">State</span>

                      <span className="cascade-info-value">
                        {selectedAuthority.location?.state || "—"}
                      </span>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="cascade-detail-block">
                      <span className="cascade-info-label">District</span>

                      <span className="cascade-info-value">
                        {selectedAuthority.location?.district || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="cascade-modal-footer">
                <button
                  type="button"
                  className="btn cascade-btn-neutral"
                  onClick={() => setSelectedAuthority(null)}
                >
                  Close
                </button>

                <button
                  type="button"
                  className="btn cascade-btn-success"
                  disabled={actionLoading === selectedAuthority._id}
                  onClick={() => handleApprove(selectedAuthority._id)}
                >
                  {actionLoading === selectedAuthority._id
                    ? "Processing..."
                    : "Approve Authority"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
                REJECT MODAL
            ========================================== */}

      {showRejectModal && selectedAuthority && (
        <div
          className="cascade-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rejectAuthorityTitle"
        >
          <div className="cascade-modal-dialog cascade-modal-dialog-small">
            <div className="cascade-modal">
              <div className="cascade-modal-header">
                <div>
                  <div className="cascade-section-eyebrow">ACCESS CONTROL</div>

                  <h2 id="rejectAuthorityTitle" className="cascade-modal-title">
                    Reject Application
                  </h2>
                </div>

                <button
                  type="button"
                  className="cascade-modal-close"
                  aria-label="Close"
                  onClick={closeRejectModal}
                >
                  ×
                </button>
              </div>

              <div className="cascade-modal-body">
                <div className="cascade-rejection-notice mb-3">
                  <strong>{selectedAuthority.name}</strong> will not receive
                  Command Center access if this application is rejected.
                </div>

                <label
                  htmlFor="rejectionReason"
                  className="cascade-info-label mb-2"
                >
                  Rejection Reason
                </label>

                <textarea
                  id="rejectionReason"
                  className="form-control cascade-textarea"
                  rows="5"
                  placeholder="Enter the reason for rejecting this authority application..."
                  value={rejectionReason}
                  onChange={(event) => setRejectionReason(event.target.value)}
                />
              </div>

              <div className="cascade-modal-footer">
                <button
                  type="button"
                  className="btn cascade-btn-neutral"
                  onClick={closeRejectModal}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn cascade-btn-danger"
                  disabled={actionLoading === selectedAuthority._id}
                  onClick={handleReject}
                >
                  {actionLoading === selectedAuthority._id
                    ? "Rejecting..."
                    : "Reject Application"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminDashboard;
