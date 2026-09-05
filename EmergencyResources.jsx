import React from "react";
import "./EmergencyResources.css";

function EmergencyResources() {
  const resources = [
    {
      icon: "🚑",
      name: "Ambulances",
      description: "Medical emergency vehicles",
      available: 18,
      total: 25,
      percentage: 72,
      status: "Available",
    },
    {
      icon: "🚒",
      name: "Fire Engines",
      description: "Fire and rescue vehicles",
      available: 12,
      total: 16,
      percentage: 75,
      status: "Available",
    },
    {
      icon: "🚁",
      name: "Rescue Helicopters",
      description: "Aerial rescue and evacuation",
      available: 4,
      total: 6,
      percentage: 67,
      status: "Limited",
    },
    {
      icon: "🧑‍🚒",
      name: "Rescue Teams",
      description: "Trained disaster response teams",
      available: 32,
      total: 40,
      percentage: 80,
      status: "Available",
    },
    {
      icon: "🚤",
      name: "Rescue Boats",
      description: "Flood rescue and evacuation boats",
      available: 9,
      total: 12,
      percentage: 75,
      status: "Available",
    },
    {
      icon: "🏠",
      name: "Relief Shelters",
      description: "Temporary accommodation facilities",
      available: 7,
      total: 10,
      percentage: 70,
      status: "Available",
    },
  ];

  const deployments = [
    {
      icon: "🌊",
      name: "Flood Response",
      location: "Zone A",
      teams: "12 Teams",
    },
    {
      icon: "🚧",
      name: "Road Blockage",
      location: "Zone C",
      teams: "6 Teams",
    },
    {
      icon: "🏚️",
      name: "Building Rescue",
      location: "Zone B",
      teams: "4 Teams",
    },
  ];

  const contacts = [
    {
      icon: "🚓",
      name: "Police",
      number: "100",
    },
    {
      icon: "🚑",
      name: "Ambulance",
      number: "108",
    },
    {
      icon: "🚒",
      name: "Fire & Rescue",
      number: "101",
    },
    {
      icon: "🆘",
      name: "Emergency",
      number: "112",
    },
  ];

  return (
    <main className="emergency-resources-page">

      {/* ================= HEADER ================= */}
      <header className="emergency-resources-header">
        <div>
          <h1 className="emergency-resources-title">
            Emergency Resources
          </h1>

          <p className="emergency-resources-subtitle">
            Monitor emergency equipment, rescue teams and relief facilities
          </p>
        </div>

        <div className="emergency-resources-status">
          Resources Online
        </div>
      </header>

      {/* ================= SUMMARY ================= */}
      <section className="emergency-summary">

        <div className="emergency-summary-card">
          <div className="emergency-summary-label">
            Total Resources
          </div>

          <div className="emergency-summary-value">
            109
          </div>

          <div className="emergency-summary-detail">
            Across all response categories
          </div>
        </div>

        <div className="emergency-summary-card">
          <div className="emergency-summary-label">
            Currently Available
          </div>

          <div className="emergency-summary-value">
            82
          </div>

          <div className="emergency-summary-detail">
            75% of total resources
          </div>
        </div>

        <div className="emergency-summary-card">
          <div className="emergency-summary-label">
            Currently Deployed
          </div>

          <div className="emergency-summary-value">
            27
          </div>

          <div className="emergency-summary-detail">
            Active response operations
          </div>
        </div>

      </section>

      {/* ================= RESOURCE AVAILABILITY ================= */}
      <section className="emergency-resources-section">

        <div className="emergency-resources-section-header">
          <div>
            <h2 className="emergency-resources-section-title">
              Resource Availability
            </h2>

            <p className="emergency-resources-section-subtitle">
              Live status of emergency response resources
            </p>
          </div>
        </div>

        <div className="emergency-resources-section-body">

          <div className="emergency-resource-grid">

            {resources.map((resource) => (
              <article
                className="emergency-resource-card"
                key={resource.name}
              >

                <div className="emergency-resource-top">

                  <div className="emergency-resource-icon">
                    {resource.icon}
                  </div>

                  <span className="emergency-resource-status">
                    {resource.status}
                  </span>

                </div>

                <h3 className="emergency-resource-name">
                  {resource.name}
                </h3>

                <p className="emergency-resource-description">
                  {resource.description}
                </p>

                <div className="emergency-resource-count">
                  <span className="emergency-resource-available">
                    {resource.available}
                  </span>

                  <span className="emergency-resource-total">
                    / {resource.total} units
                  </span>
                </div>

                <div className="emergency-resource-progress">
                  <div
                    className={`emergency-resource-progress-bar ${
                      resource.percentage < 70
                        ? "emergency-resource-progress-critical"
                        : resource.percentage < 75
                        ? "emergency-resource-progress-warning"
                        : ""
                    }`}
                    style={{
                      width: `${resource.percentage}%`,
                    }}
                  />
                </div>

                <div className="emergency-resource-status-text">
                  {resource.percentage}% available
                </div>

              </article>
            ))}

          </div>

        </div>
      </section>

      {/* ================= BOTTOM GRID ================= */}
      <div className="emergency-bottom-grid">

        {/* ================= ACTIVE DEPLOYMENTS ================= */}
        <section className="emergency-resources-section">

          <div className="emergency-resources-section-header">
            <div>
              <h2 className="emergency-resources-section-title">
                Active Deployments
              </h2>

              <p className="emergency-resources-section-subtitle">
                Current emergency response operations
              </p>
            </div>

            <span className="emergency-resource-status">
              3 Operations
            </span>
          </div>

          <div className="emergency-resources-section-body">

            <div className="emergency-deployment-list">

              {deployments.map((deployment) => (
                <div
                  className="emergency-deployment-item"
                  key={deployment.name}
                >

                  <div className="emergency-deployment-info">

                    <div className="emergency-deployment-icon">
                      {deployment.icon}
                    </div>

                    <div>
                      <h3 className="emergency-deployment-name">
                        {deployment.name}
                      </h3>

                      <p className="emergency-deployment-location">
                        {deployment.location}
                      </p>
                    </div>

                  </div>

                  <span className="emergency-deployment-count">
                    {deployment.teams}
                  </span>

                </div>
              ))}

            </div>

          </div>
        </section>

        {/* ================= EMERGENCY CONTACTS ================= */}
        <section className="emergency-resources-section">

          <div className="emergency-resources-section-header">
            <div>
              <h2 className="emergency-resources-section-title">
                Emergency Contacts
              </h2>

              <p className="emergency-resources-section-subtitle">
                Immediate response numbers
              </p>
            </div>
          </div>

          <div className="emergency-resources-section-body">

            <div className="emergency-contacts">

              {contacts.map((contact) => (
                <a
                  href={`tel:${contact.number}`}
                  className="emergency-contact"
                  key={contact.name}
                >

                  <div className="emergency-contact-name">
                    {contact.icon} {contact.name}
                  </div>

                  <div className="emergency-contact-number">
                    {contact.number}
                  </div>

                  <div className="emergency-contact-label">
                    Tap to call
                  </div>

                </a>
              ))}

            </div>

          </div>
        </section>

      </div>

    </main>
  );
}

export default EmergencyResources;