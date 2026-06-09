// This service is the eyes of the agent. It sends a query to Nimble and gets
// back real content from live web pages. The results are raw material — not yet
// readable by a human. That's Claude's job in the next service.

const axios = require("axios");

async function fetchWebResults(query) {
  // Nimble uses HTTP Basic auth where the API key is the username and the
  // password is intentionally empty. The colon separates username:password,
  // so the string to encode is "<key>:" (key, colon, nothing after it).
  // Buffer.from(...).toString("base64") is the standard Node way to Base64-encode
  // without pulling in an extra dependency.
  const credentials = Buffer.from(`${process.env.NIMBLE_API_KEY}:`).toString("base64");

  try {
    const response = await axios.post(
      "https://api.webit.live/api/v1/realtime/serp",
      {
        search_engine: "google_search",
        query,
        parse: true,
        country: "US",
      },
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
      }
    );

    const entities = response.data?.parsing?.entities ?? [];

    return entities.slice(0, 8).map((entity) => ({
      title: entity.title,
      url: entity.url,
      snippet: entity.snippet,
    }));
  } catch (error) {
    console.error("Nimble fetch failed:", error);
    throw error;
  }
}

module.exports = { fetchWebResults };
