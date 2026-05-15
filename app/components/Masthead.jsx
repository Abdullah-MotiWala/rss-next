export default function Masthead({ fetchedAt }) {
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const timeString = fetchedAt
    ? fetchedAt.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    : '--:--';

  return (
    <header className="masthead">
      <div className="masthead-top">
        <div className="masthead-top-left">
          <span>Vol. I · No. 001</span>
          <span>Proof of Concept</span>
        </div>
        <div className="masthead-top-right">
          <span className="live-indicator">
            <span className="live-dot"></span>
            Live · Updated {timeString}
          </span>
        </div>
      </div>

      <div className="masthead-main">
        <h1 className="masthead-title">The Commodity Wire</h1>
        <p className="masthead-subtitle">
          Energy · Shipping · Mining · Grain — Aggregated from the world's trade press
        </p>
        <div className="masthead-meta">
          <span className="masthead-meta-item">📅 {dateString}</span>
          <span className="masthead-meta-item">📡 Multi-source RSS</span>
          <span className="masthead-meta-item">⚙ Modular Pipeline</span>
        </div>
      </div>
    </header>
  );
}
