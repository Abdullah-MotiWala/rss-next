function formatRelativeTime(date) {
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Generate a deterministic but varied placeholder based on article content.
 * Uses the article ID's character sum to pick a pattern variant — so the
 * same article always gets the same placeholder, but different articles
 * get different patterns.
 */
function getPlaceholderVariant(article) {
  const idString = String(article.id || article.title || '');
  let sum = 0;
  for (let i = 0; i < idString.length; i++) sum += idString.charCodeAt(i);
  return sum % 4; // 4 variants
}

function PlaceholderSVG({ article }) {
  const variant = getPlaceholderVariant(article);
  const color = article.publisherColor || '#0a0908';

  // Different visual patterns per variant
  const patterns = {
    0: <CompassPattern color={color} />,
    1: <WavePattern color={color} />,
    2: <GridPattern color={color} />,
    3: <CirclePattern color={color} />,
  };

  return (
    <div className="article-image-placeholder" style={{ background: `linear-gradient(135deg, ${color}15, ${color}30)` }}>
      <svg
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        className="placeholder-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        {patterns[variant]}
      </svg>
      <div className="placeholder-overlay">
        <div className="placeholder-publisher" style={{ color }}>
          {article.publisher}
        </div>
        <div className="placeholder-section">{article.sourceName}</div>
      </div>
    </div>
  );
}

/* === SVG Pattern Components === */

function CompassPattern({ color }) {
  return (
    <g opacity="0.25">
      <circle cx="200" cy="150" r="80" fill="none" stroke={color} strokeWidth="1.5" />
      <circle cx="200" cy="150" r="60" fill="none" stroke={color} strokeWidth="1" />
      <circle cx="200" cy="150" r="40" fill="none" stroke={color} strokeWidth="0.5" />
      <line x1="200" y1="50" x2="200" y2="250" stroke={color} strokeWidth="1" />
      <line x1="100" y1="150" x2="300" y2="150" stroke={color} strokeWidth="1" />
      <line x1="129" y1="79" x2="271" y2="221" stroke={color} strokeWidth="0.5" />
      <line x1="271" y1="79" x2="129" y2="221" stroke={color} strokeWidth="0.5" />
      <polygon points="200,60 196,150 204,150" fill={color} opacity="0.6" />
      <polygon points="200,240 196,150 204,150" fill={color} opacity="0.3" />
    </g>
  );
}

function WavePattern({ color }) {
  return (
    <g opacity="0.25">
      <path
        d="M0,150 Q100,100 200,150 T400,150"
        fill="none"
        stroke={color}
        strokeWidth="2"
      />
      <path
        d="M0,180 Q100,130 200,180 T400,180"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        opacity="0.7"
      />
      <path
        d="M0,210 Q100,160 200,210 T400,210"
        fill="none"
        stroke={color}
        strokeWidth="1"
        opacity="0.5"
      />
      <path
        d="M0,120 Q100,70 200,120 T400,120"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        opacity="0.7"
      />
      <path
        d="M0,90 Q100,40 200,90 T400,90"
        fill="none"
        stroke={color}
        strokeWidth="1"
        opacity="0.5"
      />
    </g>
  );
}

function GridPattern({ color }) {
  const lines = [];
  for (let i = 0; i <= 400; i += 25) {
    lines.push(
      <line key={`v${i}`} x1={i} y1="0" x2={i} y2="300" stroke={color} strokeWidth="0.5" opacity="0.3" />
    );
  }
  for (let i = 0; i <= 300; i += 25) {
    lines.push(
      <line key={`h${i}`} x1="0" y1={i} x2="400" y2={i} stroke={color} strokeWidth="0.5" opacity="0.3" />
    );
  }
  return (
    <g>
      {lines}
      <circle cx="200" cy="150" r="60" fill={color} opacity="0.1" />
      <circle cx="200" cy="150" r="40" fill={color} opacity="0.15" />
      <circle cx="200" cy="150" r="20" fill={color} opacity="0.2" />
    </g>
  );
}

function CirclePattern({ color }) {
  return (
    <g opacity="0.3">
      <circle cx="80" cy="80" r="40" fill="none" stroke={color} strokeWidth="1" />
      <circle cx="80" cy="80" r="25" fill={color} opacity="0.15" />
      <circle cx="320" cy="80" r="30" fill="none" stroke={color} strokeWidth="1" />
      <circle cx="320" cy="80" r="15" fill={color} opacity="0.2" />
      <circle cx="80" cy="220" r="35" fill="none" stroke={color} strokeWidth="1" />
      <circle cx="320" cy="220" r="45" fill="none" stroke={color} strokeWidth="1" />
      <circle cx="320" cy="220" r="20" fill={color} opacity="0.15" />
      <circle cx="200" cy="150" r="60" fill="none" stroke={color} strokeWidth="0.8" strokeDasharray="3,3" />
    </g>
  );
}

export default function ArticleCard({ article }) {
  const openArticle = () => {
    if (article.url && article.url !== '#') {
      window.open(article.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <article className="article-card" onClick={openArticle}>
      <div className="article-image-wrap">
        {article.imageUrl ? (
          <img
            src={article.imageUrl}
            alt={article.title}
            className="article-image"
            onError={(e) => {
              // Image failed to load — swap to placeholder
              e.target.style.display = 'none';
              e.target.parentElement.classList.add('image-failed');
            }}
          />
        ) : null}
        {/* Always render placeholder; the img overlays it if it loads */}
        <PlaceholderSVG article={article} />
      </div>

      <div className="article-meta">
        <span
          className="source-badge"
          style={{ background: article.publisherColor || 'var(--ink-primary)' }}
        >
          {article.publisher}
        </span>
        <span className="source-section">{article.sourceName}</span>
        <span className="article-date">{formatRelativeTime(article.publishedAt)}</span>
      </div>

      <h2 className="article-title">{article.title}</h2>

      {article.description && (
        <p className="article-description">{article.description}</p>
      )}

      <div className="article-footer">
        <span className="read-more">Read full article</span>
        {article.sentimentScore !== undefined && (
          <span
            className="sentiment-tag"
            style={{
              color: article.sentimentScore > 0 ? 'var(--accent-bull)' : 'var(--accent-bear)',
            }}
          >
            {article.sentimentScore > 0 ? '▲' : '▼'}{' '}
            {Math.abs(article.sentimentScore).toFixed(2)}
          </span>
        )}
      </div>
    </article>
  );
}
