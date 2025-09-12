import "./HomePage.css";

export default function HomePage() {
  return (
    <div className="home-page">
      <section className="hero">
        <h1>Welcome to Braidarr</h1>
        <p>AI-powered media management and automation platform</p>
        <div className="cta">
          <button>Get Started</button>
          <button>Learn More</button>
        </div>
      </section>

      <section className="features">
        <h2>Features</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>Smart Library Management</h3>
            <p>
              Automatically organize and categorize your media library with
              AI-powered insights.
            </p>
          </div>
          <div className="feature-card">
            <h3>Plex Integration</h3>
            <p>
              Seamlessly integrate with your existing Plex server for enhanced
              functionality.
            </p>
          </div>
          <div className="feature-card">
            <h3>Automated Workflows</h3>
            <p>
              Set up custom automation rules to keep your media collection
              perfectly organized.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
