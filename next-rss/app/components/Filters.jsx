import { useMemo } from 'react';
import { SOURCES, PUBLISHERS } from '../services/dataSourceService';

export default function Filters({
  articles,
  filterPublisher,
  filterSourceId,
  onPublisherChange,
  onSourceChange,
  onRefresh,
}) {
  // Count articles per publisher
  const publisherCounts = useMemo(() => {
    const counts = {};
    PUBLISHERS.forEach(p => {
      counts[p] = articles.filter(a => a.publisher === p).length;
    });
    return counts;
  }, [articles]);

  // Count articles per source
  const sourceCounts = useMemo(() => {
    const counts = {};
    SOURCES.forEach(s => {
      counts[s.id] = articles.filter(a => a.sourceId === s.id).length;
    });
    return counts;
  }, [articles]);

  // Sub-sources visible only when a publisher is selected
  const visibleSubSources = useMemo(() => {
    if (filterPublisher === 'all') return [];
    return SOURCES.filter(s => s.publisher === filterPublisher);
  }, [filterPublisher]);

  return (
    <div className="filters-wrap">
      {/* Publisher filter */}
      <div className="filters">
        <span className="filter-label">Publisher</span>

        <button
          className={`filter-btn ${filterPublisher === 'all' ? 'active' : ''}`}
          onClick={() => {
            onPublisherChange('all');
            onSourceChange('all');
          }}
        >
          All Sources <span className="filter-count">({articles.length})</span>
        </button>

        {PUBLISHERS.map(publisher => {
          const color = SOURCES.find(s => s.publisher === publisher)?.publisherColor;
          return (
            <button
              key={publisher}
              className={`filter-btn ${filterPublisher === publisher ? 'active' : ''}`}
              onClick={() => {
                onPublisherChange(publisher);
                onSourceChange('all');
              }}
              style={
                filterPublisher === publisher
                  ? { background: color, borderColor: color }
                  : {}
              }
            >
              {publisher}{' '}
              <span className="filter-count">({publisherCounts[publisher] || 0})</span>
            </button>
          );
        })}

        <button
          className="filter-btn"
          onClick={onRefresh}
          style={{ marginLeft: 'auto' }}
          title="Refresh all feeds"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Sub-source filter (visible only when publisher selected) */}
      {visibleSubSources.length > 0 && (
        <div className="filters filters-subsources">
          <span className="filter-label">Section</span>

          <button
            className={`filter-btn ${filterSourceId === 'all' ? 'active' : ''}`}
            onClick={() => onSourceChange('all')}
          >
            All
          </button>

          {visibleSubSources.map(source => (
            <button
              key={source.id}
              className={`filter-btn filter-btn-sm ${filterSourceId === source.id ? 'active' : ''}`}
              onClick={() => onSourceChange(source.id)}
            >
              {source.name}{' '}
              <span className="filter-count">({sourceCounts[source.id] || 0})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
