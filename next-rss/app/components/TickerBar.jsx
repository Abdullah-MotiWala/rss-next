export default function TickerBar({ sourceStatus, loading, totalSources, loadedSources }) {
  if (loading) {
    return (
      <div className="ticker-bar">
        <div className="ticker-content">
          <div className="ticker-item">
            <span className="ticker-status loading"></span>
            <span>Loading initial feeds...</span>
          </div>
        </div>
      </div>
    );
  }

  if (sourceStatus.length === 0) return null;

  // Group by publisher
  const grouped = sourceStatus.reduce((acc, s) => {
    if (!acc[s.publisher]) {
      acc[s.publisher] = {
        publisher: s.publisher,
        color: s.publisherColor,
        success: 0,
        error: 0,
        total: 0,
        articles: 0,
      };
    }
    acc[s.publisher].total += 1;
    if (s.status === 'success') {
      acc[s.publisher].success += 1;
      acc[s.publisher].articles += s.count || 0;
    } else {
      acc[s.publisher].error += 1;
    }
    return acc;
  }, {});

  const totalArticles = Object.values(grouped).reduce(
    (sum, p) => sum + p.articles,
    0
  );

  return (
    <div className="ticker-bar">
      <div className="ticker-content">
        <div className="ticker-item">
          <span style={{ color: '#fbbf24', fontWeight: 700, letterSpacing: '0.15em' }}>
            ◉ LIVE
          </span>
        </div>

        {Object.values(grouped).map(p => (
          <div key={p.publisher} className="ticker-item">
            <span
              className="ticker-status"
              style={{
                background: p.error > 0 ? 'var(--accent-bear)' : 'var(--accent-bull)',
              }}
            ></span>
            <span>{p.publisher}</span>
            <span className="ticker-count">▲ {p.articles}</span>
          </div>
        ))}

        <div className="ticker-item" style={{ marginLeft: 'auto' }}>
          <span style={{ color: '#fbbf24', fontWeight: 700 }}>
            {loadedSources}/{totalSources} feeds · {totalArticles} articles
          </span>
        </div>
      </div>
    </div>
  );
}
