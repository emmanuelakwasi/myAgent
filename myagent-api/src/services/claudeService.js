const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function generateBriefing(topic, results) {
  const context = results
    .map((r, i) => `[${i + 1}] ${r.title}\n${r.snippet}\n${r.url}`)
    .join("\n\n");

  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 1024,
    thinking: { type: "adaptive" },
    system:
      "You are a research analyst. Given a topic and a list of recent web results, write a concise 2-3 sentence briefing that captures the most important developments. Be factual and direct. Do not reference the result numbers.",
    messages: [
      {
        role: "user",
        content: `Topic: ${topic}\n\nRecent web results:\n\n${context}`,
      },
    ],
  });

  return response.content.find((block) => block.type === "text")?.text ?? "";
}

module.exports = { generateBriefing };
