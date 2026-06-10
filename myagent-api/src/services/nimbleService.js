const axios = require('axios');
const Parser = require('rss-parser');

const rssParser = new Parser({ timeout: 10000 });

// ─── Core SERP search ────────────────────────────────────────────────────────

async function fetchFromNimble(query) {
  // Nimble token-based keys use Bearer auth, not Basic auth.
  const response = await axios.post(
    'https://api.webit.live/api/v1/realtime/serp',
    { search_engine: 'google_search', query, parse: true, country: 'US' },
    {
      headers: {
        'Authorization': `Bearer ${process.env.NIMBLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 40000,
    }
  );

  const entities = response.data?.parsing?.entities;
  if (!entities) throw new Error('Nimble returned unexpected response shape');

  const organicResults = entities.OrganicResult || [];
  console.log('Nimble returned', organicResults.length, 'organic results');

  return organicResults.slice(0, 8).map(e => ({
    title: e.title || 'No title',
    url: e.url || '',
    snippet: e.snippet || e.description || '',
  }));
}

async function fetchFromRSS(query) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
  const feed = await rssParser.parseURL(url);
  console.log('RSS fallback returned', feed.items.length, 'results');
  return feed.items.slice(0, 8).map(item => ({
    title: item.title || '',
    url: item.link || '',
    snippet: item.contentSnippet || item.title || '',
  }));
}

async function fetchWebResults(query) {
  try {
    return await fetchFromNimble(query);
  } catch (err) {
    if (err.response) {
      console.error('Nimble HTTP error:', err.response.status, JSON.stringify(err.response.data));
    } else {
      console.warn('Nimble unavailable, falling back to RSS:', err.message);
    }
    return await fetchFromRSS(query);
  }
}

// Internal alias used by fetchCompetitorIntel
const searchWeb = fetchWebResults;

// ─── Page extraction ─────────────────────────────────────────────────────────

// Fetches the top result's URL and strips HTML down to plain text.
// Non-fatal — returns null on any failure and the caller falls back to snippet.
async function extractPage(url) {
  try {
    const response = await axios.get(url, {
      timeout: 7000,
      maxContentLength: 400000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; myagent-bot/1.0)' },
    });
    const html = response.data;
    if (typeof html !== 'string') return null;

    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return text.slice(0, 2000) || null;
  } catch {
    return null;
  }
}

// ─── Competitive intelligence ─────────────────────────────────────────────────

async function fetchCompetitorIntel(companyName) {
  const queries = [
    {
      label: 'REPUTATION',
      angle: 'What customers and users actually think',
      query: `${companyName} customer reviews complaints problems 2026`
    },
    {
      label: 'PRODUCT',
      angle: 'Recent launches, features, and product direction',
      query: `${companyName} new features product launch announcement 2026`
    },
    {
      label: 'GROWTH',
      angle: 'Hiring, funding, and expansion signals',
      query: `${companyName} hiring jobs funding expansion 2026`
    },
    {
      label: 'PRESS',
      angle: 'Media narrative and recent coverage',
      query: `${companyName} news press coverage 2026`
    }
  ];

  // Run all four searches in parallel — this is what makes it feel fast
  const results = await Promise.allSettled(
    queries.map(async (q) => {
      const raw = await searchWeb(q.query);

      // Enrich only the top result per category to keep latency low
      const top = raw[0];
      if (top) {
        const fullContent = await extractPage(top.url);
        raw[0] = { ...top, content: fullContent || top.snippet, enriched: !!fullContent };
      }

      // Rest get snippets only
      const rest = raw.slice(1).map(r => ({ ...r, content: r.snippet, enriched: false }));

      return {
        label: q.label,
        angle: q.angle,
        results: [raw[0], ...rest].filter(Boolean).slice(0, 5)
      };
    })
  );

  // Handle partial failures — if one category fails, the others still show
  return results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value;
    console.warn(`Category ${queries[i].label} failed:`, r.reason?.message);
    return { label: queries[i].label, angle: queries[i].angle, results: [], failed: true };
  });
}

module.exports = { fetchWebResults, fetchCompetitorIntel };
