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

async function generateCompetitorBrief(companyName, categories, userContext = '') {
  try {
    const context = categories.map(cat => {
      if (cat.failed) return `## ${cat.label}\n[Data unavailable for this category]`;

      const sources = cat.results.map((r, i) => {
        const quality = r.enriched ? '[FULL READ]' : '[SNIPPET]';
        return `  Source ${i + 1} ${quality}: ${r.title}\n  URL: ${r.url}\n  Content: ${r.content?.slice(0, 800)}`;
      }).join('\n\n');

      return `## ${cat.label} — ${cat.angle}\n${sources}`;
    }).join('\n\n---\n\n');

    const systemPrompt = `You are a senior competitive intelligence analyst at a top strategy firm.
A client has asked you to analyze a company. You have real web data from four angles.

Your report must follow this EXACT structure with these EXACT headers.
Each section must be specific, cited, and actionable. No filler. No vague statements.
If data is thin for a section, say so explicitly rather than padding.

REPUTATION
What do customers and users actually think? Specific complaints or praise.
Cite sources. 2-3 sentences max.

PRODUCT
What have they shipped or announced recently? Any notable direction changes?
Cite sources. 2-3 sentences max.

GROWTH
What do their hiring patterns, funding news, or expansion moves signal?
What are they building toward? 2-3 sentences max.

PRESS
What is the current media narrative around them? Positive, negative, or neutral?
Any stories gaining traction? 2-3 sentences max.

STRATEGIC TAKE
This is the most important section. Given all of the above, what should
someone competing with or watching this company actually DO right now?
Be direct. Be specific. Give a real recommendation, not a platitude.
2-3 sentences.

THREAT LEVEL
Rate as: LOW / MEDIUM / HIGH / CRITICAL
One sentence explaining the rating based on the data above.`;

    const userPrompt = `Company being analyzed: ${companyName}
${userContext ? `Analyst context: ${userContext}` : ''}

Here is the intelligence gathered:

${context}

Write the competitive intelligence report now.
Be specific. Cite real sources. Make the Strategic Take genuinely useful.`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1500,
      temperature: 0.2,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
    });

    return response.choices[0].message.content;
  } catch (err) {
    console.error('Groq competitor brief failed:', err.message);
    throw err;
  }
}

async function generateComparisonVerdict(companyA, reportA, companyB, reportB) {
  try {
    const systemPrompt = `You are a senior competitive strategist. You will be given two
full competitive intelligence reports, one for each of two companies.

Write a head-to-head verdict in 3 to 4 sentences:
- State plainly which of the two companies poses the bigger competitive threat overall.
- Call out the 1-2 sharpest differentiators between them (product, growth, reputation, or press).
- Be direct and specific. No filler, no hedging, no "it depends".`;

    const userPrompt = `COMPANY A: ${companyA}
${reportA}

---

COMPANY B: ${companyB}
${reportB}

Write the head-to-head verdict now.`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 300,
      temperature: 0.2,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
    });

    return response.choices[0].message.content;
  } catch (err) {
    console.error('Groq comparison verdict failed:', err.message);
    throw err;
  }
}

module.exports = { generateBriefing, generateCompetitorBrief, generateComparisonVerdict };
