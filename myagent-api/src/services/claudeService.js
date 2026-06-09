// This service is the brain of the agent.
// It reads raw web content and produces a structured briefing.
// Uses Groq (free tier) with Llama 3 for fast, reliable inference.

const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are a sharp, concise intelligence analyst. Your job is to read a set
of web sources and produce a daily briefing for someone monitoring a topic.
Your briefing has exactly three sections:

WHAT'S NEW — 2 to 3 sentences describing genuinely new or notable information
found across the sources. Be specific. Name sources, dates, and claims.

WHAT MATTERS — 1 to 2 sentences on why this is relevant or what the person
should pay attention to.

NOISE — 1 sentence flagging anything that appears to be spam, recycled content,
or irrelevant to the topic.

Write in plain, direct English. No filler phrases. No "it's worth noting".
Do not hallucinate details not present in the sources.
Always use the exact three section headers: WHAT'S NEW, WHAT MATTERS, NOISE.`;

async function generateBriefing(topic, results) {
  const context = results
    .map((r, i) => `SOURCE ${i + 1}\nTitle: ${r.title}\nURL: ${r.url}\nExcerpt: ${r.snippet}`)
    .join('\n\n');

  const prompt = `Topic I am monitoring: ${topic}\n\nHere are today's web sources:\n${context}\n\nWrite the briefing now.`;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 512,
    });

    return completion.choices[0].message.content;
  } catch (err) {
    console.error('Groq briefing failed:', err.message);
    throw err;
  }
}

module.exports = { generateBriefing };
