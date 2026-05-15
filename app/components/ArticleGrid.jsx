import ArticleCard from './ArticleCard';
import { PUBLISHERS, SOURCES } from '../services/dataSourceService';

export default function ArticleGrid({ articles, filterPublisher }) {
  if (articles.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-title">No articles to display</div>
        <p className="empty-text">Try clearing the filter or refreshing the feeds.</p>
      </div>
    );
  }

  // If filtering by specific publisher, show flat grid (no nested grouping needed)
  if (filterPublisher !== 'all') {
    return (
      <div>
        <div className="section-rule">
          <div className="section-rule-line"></div>
          <div className="section-rule-title">{filterPublisher}</div>
          <div className="section-rule-meta">
            {articles.length} {articles.length === 1 ? 'article' : 'articles'}
          </div>
          <div className="section-rule-line"></div>
        </div>

        <div className="article-grid">
          {articles.map(article => (
            <div key={article.id} className="article-regular">
              <ArticleCard article={article} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Otherwise, group by publisher with publisher-specific section headings
  // Use natural source order so layout is consistent across renders
  const grouped = PUBLISHERS.reduce((acc, publisher) => {
    const publisherArticles = articles.filter(a => a.publisher === publisher);
    if (publisherArticles.length > 0) {
      acc[publisher] = publisherArticles;
    }
    return acc;
  }, {});

  return (
    <div>
      {Object.entries(grouped).map(([publisher, publisherArticles]) => {
        const publisherColor = SOURCES.find(s => s.publisher === publisher)?.publisherColor;

        return (
          <section key={publisher} className="publisher-section">
            {/* Publisher heading */}
            <div className="publisher-heading">
              <div className="publisher-heading-rule" style={{ background: publisherColor }}></div>
              <div className="publisher-heading-content">
                <div className="publisher-name" style={{ color: publisherColor }}>
                  {publisher}
                </div>
                <div className="publisher-count">
                  {publisherArticles.length} {publisherArticles.length === 1 ? 'article' : 'articles'}
                </div>
              </div>
              <div className="publisher-heading-rule" style={{ background: publisherColor }}></div>
            </div>

            {/* Publisher's articles in grid */}
            <div className="article-grid">
              {publisherArticles.map(article => (
                <div key={article.id} className="article-regular">
                  <ArticleCard article={article} />
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
