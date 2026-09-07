import "./dashboard.css";
function Dashboard() {
  return (
    <div className="container-fluid p-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Authority Command Center</h2>
          <p className="text-muted mb-0">
            Disaster monitoring and emergency response dashboard
          </p>
        </div>

        <div>
          <span className="badge bg-success p-2">
            ● System Online
          </span>
        </div>
      </div>


      {/* Risk Summary Cards */}
      <div className="row g-3">

        <div className="col-md-3">
          <div className="card shadow-sm border-0 p-3">
            <p className="text-muted mb-1">Current Risk Score</p>
            <h2 className="fw-bold">78</h2>
            <span className="badge bg-danger">High Risk</span>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-0 p-3">
            <p className="text-muted mb-1">Vulnerable Zones</p>
            <h2 className="fw-bold">12</h2>
            <span className="badge bg-warning text-dark">
              Moderate
            </span>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-0 p-3">
            <p className="text-muted mb-1">Active Incidents</p>
            <h2 className="fw-bold">08</h2>
            <span className="badge bg-danger">
              Critical
            </span>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-0 p-3">
            <p className="text-muted mb-1">Road Connectivity</p>
            <h2 className="fw-bold">82%</h2>
            <span className="badge bg-success">
              Stable
            </span>
          </div>
        </div>

      </div>


      {/* Main Dashboard */}
      <div className="row g-4 mt-2">

        {/* Incidents */}
        <div className="col-lg-8">

          <div className="card shadow-sm border-0">
            <div className="card-header bg-white">
              <h5 className="mb-0 fw-bold">
                Active Incidents
              </h5>
            </div>

            <div className="card-body">

              <div className="table-responsive">

                <table className="table align-middle">

                  <thead>
                    <tr>
                      <th>Incident</th>
                      <th>Location</th>
                      <th>Severity</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>

                    <tr>
                      <td>Flood</td>
                      <td>Zone A</td>
                      <td>
                        <span className="badge bg-danger">
                          Critical
                        </span>
                      </td>
                      <td>Response Active</td>
                    </tr>

                    <tr>
                      <td>Road Blockage</td>
                      <td>Zone C</td>
                      <td>
                        <span className="badge bg-warning text-dark">
                          High
                        </span>
                      </td>
                      <td>Under Investigation</td>
                    </tr>

                    <tr>
                      <td>Heavy Rainfall</td>
                      <td>Zone B</td>
                      <td>
                        <span className="badge bg-warning text-dark">
                          Moderate
                        </span>
                      </td>
                      <td>Monitoring</td>
                    </tr>

                    <tr>
                      <td>Fire</td>
                      <td>Zone D</td>
                      <td>
                        <span className="badge bg-danger">
                          High
                        </span>
                      </td>
                      <td>Response Active</td>
                    </tr>

                  </tbody>

                </table>

              </div>

            </div>
          </div>

        </div>


        {/* Weather */}
        <div className="col-lg-4">

          <div className="card shadow-sm border-0 mb-4">

            <div className="card-header bg-white">
              <h5 className="mb-0 fw-bold">
                Weather Risk
              </h5>
            </div>

            <div className="card-body">

              <h2>🌧️ 28°C</h2>

              <p className="text-muted">
                Heavy rainfall expected
              </p>

              <div className="progress mb-2">
                <div
                  className="progress-bar bg-danger"
                  style={{ width: "75%" }}
                >
                  75%
                </div>
              </div>

              <small className="text-muted">
                Weather-linked risk level
              </small>

            </div>

          </div>


          {/* Emergency Response */}
          <div className="card shadow-sm border-0">

            <div className="card-header bg-white">
              <h5 className="mb-0 fw-bold">
                Emergency Response
              </h5>
            </div>

            <div className="card-body">

              <div className="d-flex justify-content-between mb-3">
                <span>Ambulances</span>
                <strong>14 Available</strong>
              </div>

              <div className="d-flex justify-content-between mb-3">
                <span>Fire Units</span>
                <strong>08 Available</strong>
              </div>

              <div className="d-flex justify-content-between">
                <span>Rescue Teams</span>
                <strong>06 Active</strong>
              </div>

            </div>

          </div>

        </div>

      </div>


      {/* Road Connectivity */}
      <div className="card shadow-sm border-0 mt-4">

        <div className="card-header bg-white">
          <h5 className="mb-0 fw-bold">
            Road Connectivity Status
          </h5>
        </div>

        <div className="card-body">

          <div className="row">

            <div className="col-md-4">
              <h6>Open Roads</h6>
              <h3 className="text-success">68</h3>
            </div>

            <div className="col-md-4">
              <h6>Partially Blocked</h6>
              <h3 className="text-warning">12</h3>
            </div>

            <div className="col-md-4">
              <h6>Closed Roads</h6>
              <h3 className="text-danger">05</h3>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;