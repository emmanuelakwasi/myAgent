// This service is the eyes of the agent.
// It sends a query to Nimble and returns real content from live web pages.
// Falls back to Google News RSS if Nimble times out, so the demo never stalls.

const axios = require('axios');
const Parser = require('rss-parser');

const rssParser = new Parser({ timeout: 10000 });

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

module.exports = { fetchWebResults };
