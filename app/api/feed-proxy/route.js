/**
 * SIMPLE RSS FEED PROXY — Next.js App Router
 * 
 * Fetches RSS feeds server-side (no browser CORS issues).
 * Works identically in dev (`npm run dev`) and production (Vercel).
 * 
 * No ScrapingBee needed — all sources are public, RSS-friendly:
 *   - Google News RSS (aggregator-friendly by design)
 *   - Hellenic Shipping News (public RSS)
 *   - World Grain (public RSS)
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return Response.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  if (!/^https?:\/\//i.test(targetUrl)) {
    return Response.json({ error: 'Only http(s) URLs allowed' }, { status: 400 });
  }

  try {
    const upstreamResponse = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept':
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!upstreamResponse.ok) {
      return Response.json(
        {
          error: `Upstream returned ${upstreamResponse.status}`,
          url: targetUrl,
        },
        { status: upstreamResponse.status }
      );
    }

    const text = await upstreamResponse.text();

    return new Response(text, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 's-maxage=600, stale-while-revalidate=300',
      },
    });
  } catch (err) {
    return Response.json(
      { error: err.message || 'Unknown error', url: targetUrl },
      { status: 500 }
    );
  }
}
