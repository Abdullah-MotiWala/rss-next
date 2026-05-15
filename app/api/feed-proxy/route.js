/**
 * SMART RSS FEED PROXY — Next.js App Router
 * 
 * For most sites: direct server-side fetch (fast, free)
 * For bot-protected sites (LNG Prime's Cloudflare):
 *   routes through ScrapingBee residential proxy
 * 
 * Required Vercel env var for LNG Prime:
 *   SCRAPING_BEE_API_KEY=your_key_here
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Hosts known to have strict bot protection (need ScrapingBee or similar)
const BOT_PROTECTED_HOSTS = [
  'lngprime.com',
];

function needsBotBypass(url) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return BOT_PROTECTED_HOSTS.some(blocked => host.endsWith(blocked));
  } catch {
    return false;
  }
}

async function fetchDirect(url) {
  return fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Accept':
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Upgrade-Insecure-Requests': '1',
    },
    signal: AbortSignal.timeout(8000),
  });
}

async function fetchViaScrapingBee(url) {
  const key = process.env.SCRAPING_BEE_API_KEY;

  if (!key) {
    throw new Error(
      'SCRAPING_BEE_API_KEY not set in environment. Add it to Vercel Project Settings → Environment Variables, then redeploy.'
    );
  }

  const scrapingBeeUrl = new URL('https://app.scrapingbee.com/api/v1/');
  scrapingBeeUrl.searchParams.set('api_key', key);
  scrapingBeeUrl.searchParams.set('url', url);
  scrapingBeeUrl.searchParams.set('render_js', 'false'); // RSS doesn't need JS
  scrapingBeeUrl.searchParams.set('premium_proxy', 'true'); // Residential IPs

  return fetch(scrapingBeeUrl.toString(), {
    signal: AbortSignal.timeout(15000), // ScrapingBee is slower
  });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return Response.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  if (!/^https?:\/\//i.test(targetUrl)) {
    return Response.json({ error: 'Only http(s) URLs allowed' }, { status: 400 });
  }

  const useBotBypass = needsBotBypass(targetUrl);

  try {
    const upstreamResponse = useBotBypass
      ? await fetchViaScrapingBee(targetUrl)
      : await fetchDirect(targetUrl);

    if (!upstreamResponse.ok) {
      return Response.json(
        {
          error: `Upstream returned ${upstreamResponse.status}`,
          url: targetUrl,
          usedBotBypass: useBotBypass,
          hint: useBotBypass
            ? 'ScrapingBee returned an error — check SCRAPING_BEE_API_KEY value and credits at scrapingbee.com'
            : 'Site may have added bot protection — consider adding to BOT_PROTECTED_HOSTS list',
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
      {
        error: err.message || 'Unknown error',
        url: targetUrl,
        usedBotBypass: useBotBypass,
      },
      { status: 500 }
    );
  }
}
