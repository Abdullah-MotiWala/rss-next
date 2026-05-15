/**
 * UNIFIED DATA SOURCE SERVICE — Progressive Loading
 * 
 * Sources:
 *   1. Hellenic Shipping News (RSS) — Shipping, oil, energy news
 *   2. World Grain (RSS) — Grain industry news
 *   3. Marketaux (API) — Stock market sentiment data
 * 
 * All sources go through our own Next.js API routes — no public proxy
 * dependency, same code path in dev and production, secure API keys.
 */

export const SOURCES = [
  /* ===== HELLENIC SHIPPING NEWS ===== */
  {
    id: 'hellenic-top',
    publisher: 'Hellenic Shipping',
    publisherColor: '#0d7464',
    name: 'Top Stories',
    type: 'rss',
    category: 'Shipping',
    priority: 'initial',
    feedUrl: 'https://www.hellenicshippingnews.com/tag/top-stories/feed/',
  },
  {
    id: 'hellenic-international',
    publisher: 'Hellenic Shipping',
    publisherColor: '#0d7464',
    name: 'International Shipping',
    type: 'rss',
    category: 'Shipping',
    priority: 'lazy',
    feedUrl: 'https://www.hellenicshippingnews.com/category/international-shipping-news/feed/',
  },
  {
    id: 'hellenic-drybulk',
    publisher: 'Hellenic Shipping',
    publisherColor: '#0d7464',
    name: 'Dry Bulk Market',
    type: 'rss',
    category: 'Shipping',
    priority: 'lazy',
    feedUrl: 'https://www.hellenicshippingnews.com/category/dry-bulk-market/feed/',
  },
  {
    id: 'hellenic-piracy',
    publisher: 'Hellenic Shipping',
    publisherColor: '#0d7464',
    name: 'Piracy & Security News',
    type: 'rss',
    category: 'Shipping',
    priority: 'lazy',
    feedUrl: 'https://www.hellenicshippingnews.com/category/piracy-and-security-news/feed/',
  },
  {
    id: 'hellenic-port',
    publisher: 'Hellenic Shipping',
    publisherColor: '#0d7464',
    name: 'Port News',
    type: 'rss',
    category: 'Shipping',
    priority: 'lazy',
    feedUrl: 'https://www.hellenicshippingnews.com/category/port-news/feed/',
  },
  {
    id: 'hellenic-shipbuilding',
    publisher: 'Hellenic Shipping',
    publisherColor: '#0d7464',
    name: 'Shipbuilding News',
    type: 'rss',
    category: 'Shipping',
    priority: 'lazy',
    feedUrl: 'https://www.hellenicshippingnews.com/category/shipbuilding-news/feed/',
  },
  {
    id: 'hellenic-oil',
    publisher: 'Hellenic Shipping',
    publisherColor: '#0d7464',
    name: 'Oil & Companies News',
    type: 'rss',
    category: 'Energy',
    priority: 'lazy',
    feedUrl: 'https://www.hellenicshippingnews.com/category/oil-companies-news/feed/',
  },
  {
    id: 'hellenic-energy',
    publisher: 'Hellenic Shipping',
    publisherColor: '#0d7464',
    name: 'General Energy News',
    type: 'rss',
    category: 'Energy',
    priority: 'lazy',
    feedUrl: 'https://www.hellenicshippingnews.com/category/general-energy-news/feed/',
  },
  {
    id: 'hellenic-economy',
    publisher: 'Hellenic Shipping',
    publisherColor: '#0d7464',
    name: 'World Economy News',
    type: 'rss',
    category: 'Economy',
    priority: 'lazy',
    feedUrl: 'https://www.hellenicshippingnews.com/category/world-economy-news/feed/',
  },
  {
    id: 'hellenic-commodity',
    publisher: 'Hellenic Shipping',
    publisherColor: '#0d7464',
    name: 'Commodity News',
    type: 'rss',
    category: 'Commodities',
    priority: 'lazy',
    feedUrl: 'https://www.hellenicshippingnews.com/category/commodity-news/feed/',
  },
  {
    id: 'hellenic-stock',
    publisher: 'Hellenic Shipping',
    publisherColor: '#0d7464',
    name: 'Stock Market News',
    type: 'rss',
    category: 'Markets',
    priority: 'lazy',
    feedUrl: 'https://www.hellenicshippingnews.com/category/stock-market-news/feed/',
  },

  /* ===== WORLD GRAIN — Topic feed (main /rss is HTML directory) ===== */
  {
    id: 'world-grain-aba',
    publisher: 'World Grain',
    publisherColor: '#a16207',
    name: 'ABA',
    type: 'rss',
    category: 'Grain',
    priority: 'initial',
    feedUrl: 'https://www.world-grain.com/rss/topic/1041-aba',
  },

  /* ===== MARKETAUX ===== */
  {
    id: 'marketaux-energy',
    publisher: 'Marketaux',
    publisherColor: '#7c3aed',
    name: 'Energy (Sentiment)',
    type: 'marketaux',
    category: 'Energy',
    priority: 'initial',
    filters: { industries: 'Energy' },
  },
  {
    id: 'marketaux-materials',
    publisher: 'Marketaux',
    publisherColor: '#7c3aed',
    name: 'Basic Materials',
    type: 'marketaux',
    category: 'Commodities',
    priority: 'lazy',
    filters: { industries: 'Basic Materials' },
  },
];

export const INITIAL_SOURCES = SOURCES.filter(s => s.priority === 'initial');
export const LAZY_SOURCES = SOURCES.filter(s => s.priority === 'lazy');
export const PUBLISHERS = [...new Set(SOURCES.map(s => s.publisher))];
export const CATEGORIES = [...new Set(SOURCES.map(s => s.category))];

/* ============================================================
   TRANSFORMERS
   ============================================================ */

function transformRSSItem(item, source) {
  const imageUrl = extractImageFromRSS(item);
  const cleanDescription = cleanText(
    item.description || item['content:encoded'] || ''
  );

  return {
    id: item.guid || item.link || `${source.id}-${item.title}`,
    sourceId: source.id,
    publisher: source.publisher,
    publisherColor: source.publisherColor,
    sourceName: source.name,
    sourceType: 'rss',
    category: source.category,
    title: cleanText(item.title || 'Untitled'),
    description: truncate(cleanDescription, 280),
    url: item.link || '#',
    imageUrl,
    publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
    categories: Array.isArray(item.categories) ? item.categories : [],
  };
}

function transformMarketauxItem(item, source) {
  const primaryEntity = item.entities?.length
    ? [...item.entities].sort((a, b) => (b.match_score || 0) - (a.match_score || 0))[0]
    : null;

  return {
    id: item.uuid,
    sourceId: source.id,
    publisher: source.publisher,
    publisherColor: source.publisherColor,
    sourceName: source.name,
    sourceType: 'marketaux',
    category: source.category,
    title: item.title || 'Untitled',
    description: truncate(item.snippet || item.description || '', 280),
    url: item.url || '#',
    imageUrl: item.image_url || null,
    publishedAt: item.published_at ? new Date(item.published_at) : new Date(),
    categories: [
      ...new Set((item.entities || []).map(e => e.industry).filter(Boolean)),
    ],
    sentimentScore: primaryEntity?.sentiment_score,
    entities: item.entities || [],
    relevanceScore: item.relevance_score,
    sourceDomain: item.source,
  };
}

/* ============================================================
   FETCHERS — All go through our own Next.js API routes
   ============================================================ */

async function fetchRSSFeed(source) {
  const proxyUrl = `/api/feed-proxy?url=${encodeURIComponent(source.feedUrl)}`;
  console.log(`[RSS] ${source.publisher} — ${source.name}`);

  try {
    const response = await fetch(proxyUrl);

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      console.error(`[RSS] HTTP ${response.status} for ${source.name}: ${body.slice(0, 100)}`);
      throw new Error(`HTTP ${response.status}`);
    }

    const xmlText = await response.text();
    const items = parseRSSXML(xmlText);
    const articles = items.map(item => transformRSSItem(item, source));
    console.log(`[RSS] ✓ ${source.name}: ${articles.length} articles`);
    return { source, articles, status: 'success' };
  } catch (err) {
    console.error(`[RSS] ✗ ${source.name}: ${err.message}`);
    return { source, articles: [], status: 'error', error: err.message };
  }
}

async function fetchMarketaux(source) {
  const params = new URLSearchParams(source.filters);
  const url = `/api/marketaux?${params}`;
  console.log(`[Marketaux] ${source.name}`);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      console.error(`[Marketaux] ${source.name}: ${data.error || response.status}`);
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data.error) throw new Error(data.error);

    const items = data.data || [];
    const articles = items.map(item => transformMarketauxItem(item, source));
    console.log(`[Marketaux] ✓ ${source.name}: ${articles.length} articles`);
    return { source, articles, status: 'success' };
  } catch (err) {
    console.error(`[Marketaux] ✗ ${source.name}: ${err.message}`);
    return { source, articles: [], status: 'error', error: err.message };
  }
}

function fetchOne(source) {
  switch (source.type) {
    case 'rss':
      return fetchRSSFeed(source);
    case 'marketaux':
      return fetchMarketaux(source);
    default:
      return Promise.resolve({
        source,
        articles: [],
        status: 'error',
        error: 'Unknown source type',
      });
  }
}

/* ============================================================
   PUBLIC API
   ============================================================ */

export async function fetchInitialSources() {
  const results = await Promise.all(INITIAL_SOURCES.map(fetchOne));
  return processResults(results);
}

export async function fetchOneSource(sourceId) {
  const source = SOURCES.find(s => s.id === sourceId);
  if (!source) {
    return { articles: [], sourceStatus: [], fetchedAt: new Date() };
  }
  const result = await fetchOne(source);
  return processResults([result]);
}

function processResults(results) {
  const allArticles = [];
  const sourceStatus = [];

  results.forEach(result => {
    const { source, articles, status, error } = result;
    allArticles.push(...articles);
    sourceStatus.push({
      sourceId: source.id,
      publisher: source.publisher,
      publisherColor: source.publisherColor,
      sourceName: source.name,
      category: source.category,
      sourceType: source.type,
      status,
      count: articles.length,
      error,
    });
  });

  return {
    articles: allArticles,
    sourceStatus,
    fetchedAt: new Date(),
  };
}

/* ============================================================
   UTILITIES
   ============================================================ */

function parseRSSXML(xmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');

  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    console.error('XML parse error:', parseError.textContent);
    return [];
  }

  const items = doc.querySelectorAll('item');
  return Array.from(items).map(item => ({
    title: getNodeText(item, 'title'),
    link: getNodeText(item, 'link'),
    description: getNodeText(item, 'description'),
    pubDate: getNodeText(item, 'pubDate'),
    guid: getNodeText(item, 'guid'),
    categories: Array.from(item.querySelectorAll('category')).map(c => c.textContent),
    'content:encoded': item.getElementsByTagNameNS('*', 'encoded')[0]?.textContent,
    'media:content': item.getElementsByTagNameNS('*', 'content')[0]?.getAttribute('url'),
    enclosure: item.querySelector('enclosure')?.getAttribute('url'),
  }));
}

function getNodeText(parent, selector) {
  try {
    return parent.querySelector(selector)?.textContent?.trim() || '';
  } catch {
    return '';
  }
}

function extractImageFromRSS(item) {
  if (item['media:content']) return item['media:content'];
  if (item.enclosure) return item.enclosure;

  const content = item['content:encoded'] || item.description || '';
  const imgMatches = [...content.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)];

  for (const match of imgMatches) {
    const url = match[1];
    if (/feedburner|feedsportal|doubleclick|googleads|pixel\.gif/i.test(url)) continue;
    if (/[?&](w|width|h|height)=1[&"']/i.test(url)) continue;
    return url;
  }

  return null;
}

function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&hellip;/g, '...')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(text, maxLength) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '…';
}

export function deduplicateArticles(articles) {
  const seen = new Set();
  return articles.filter(article => {
    const key = normalizeUrl(article.url);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeUrl(url) {
  if (!url) return Math.random().toString();
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}${parsed.pathname}`.toLowerCase().replace(/\/$/, '');
  } catch {
    return url.toLowerCase();
  }
}
