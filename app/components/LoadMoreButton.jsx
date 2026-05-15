export default function LoadMoreButton({
  onLoadMore,
  onLoadAll,
  loading,
  remaining,
  nextSource,
}) {
  return (
    <div className="load-more-section">
      <div className="load-more-rule"></div>
      
      {/* <div className="load-more-info">
        <div className="load-more-meta">
          <span className="load-more-label">More coverage available</span>
          <span className="load-more-count">
            {remaining} {remaining === 1 ? 'category' : 'categories'} pending
          </span>
        </div>
        {nextSource && !loading && (
          <div className="load-more-next">
            Next: <strong>{nextSource.publisher}</strong> — {nextSource.name}
          </div>
        )}
        {loading && (
          <div className="load-more-next">
            <span className="load-more-spinner"></span>
            Fetching {nextSource?.publisher} — {nextSource?.name}...
          </div>
        )}
      </div> */}

      <div className="load-more-actions">
        {/* <button
          className="load-more-btn primary"
          onClick={onLoadMore}
          disabled={loading}
        >
          {loading ? 'Loading...' : '↓ Load Next Category'}
        </button> */}
        
        {remaining > 1 && (
          <button
            className="load-more-btn secondary"
            onClick={onLoadAll}
            disabled={loading}
          >
            Load All ({remaining})
          </button>
        )}
      </div>

      <div className="load-more-rule"></div>
    </div>
  );
}
