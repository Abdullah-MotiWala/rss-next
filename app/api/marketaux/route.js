/**
 * MARKETAUX API ROUTE — Server-side proxy
 * 
 * Why this exists:
 * - In Vite, VITE_MARKETAUX_API_KEY gets bundled into frontend JS (visible to anyone)
 * - In Next.js, env vars without NEXT_PUBLIC_ prefix stay server-side (secure)
 * 
 * Frontend calls this endpoint; we add the API key server-side and forward.
 * 
 * Usage from frontend:
 *   /api/marketaux?industries=Energy
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const apiKey = process.env.MARKETAUX_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: 'Marketaux API key not configured on server. Add MARKETAUX_API_KEY to .env.local',
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Pass through all query params + add API key
  const params = new URLSearchParams(searchParams);
  params.set('api_token', apiKey);
  params.set('filter_entities', 'true');
  params.set('language', 'en');
  if (!params.has('limit')) params.set('limit', '20');

  try {
    const upstreamResponse = await fetch(
      `https://api.marketaux.com/v1/news/all?${params}`,
      { signal: AbortSignal.timeout(8000) }
    );

    if (!upstreamResponse.ok) {
      let errorMsg = `HTTP ${upstreamResponse.status}`;
      if (upstreamResponse.status === 401) errorMsg = 'Invalid Marketaux API key';
      else if (upstreamResponse.status === 402) errorMsg = 'Daily quota exceeded';
      else if (upstreamResponse.status === 429) errorMsg = 'Rate limited';

      return new Response(
        JSON.stringify({ error: errorMsg }),
        { status: upstreamResponse.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await upstreamResponse.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=300, stale-while-revalidate=60',
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
