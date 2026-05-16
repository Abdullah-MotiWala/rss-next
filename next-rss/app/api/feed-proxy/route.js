/**
 * RSS FEED PROXY — Next.js App Router API Route
 * 
 * Fetches RSS feeds server-side (no browser CORS issues).
 * Works identically in dev (`npm run dev`) and production (Vercel).
 * 
 * Usage from frontend:
 *   /api/feed-proxy?url=https://lngprime.com/feed/
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return new Response(
      JSON.stringify({ error: 'Missing url parameter' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // SSRF guard
  if (!/^https?:\/\//i.test(targetUrl)) {
    return new Response(
      JSON.stringify({ error: 'Only http(s) URLs allowed' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const upstreamResponse = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        // Full realistic browser headers — bypasses most bot detection
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept':
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="121", "Google Chrome";v="121"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
      },
      // Wait up to 8 seconds (Vercel Hobby plan has 10s limit)
      signal: AbortSignal.timeout(8000),
    });

    if (!upstreamResponse.ok) {
      return new Response(
        JSON.stringify({
          error: `Upstream returned ${upstreamResponse.status}`,
          url: targetUrl,
        }),
        { status: upstreamResponse.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const text = await upstreamResponse.text();

    return new Response(text, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        // Cache for 10 minutes — speed + reduce upstream load
        'Cache-Control': 's-maxage=600, stale-while-revalidate=300',
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err.message || 'Unknown error',
        url: targetUrl,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
