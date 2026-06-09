const express = require("express");
const router = express.Router();
const supabase = require("../services/supabaseClient");
const { fetchWebResults } = require("../services/nimbleService");
const { generateBriefing } = require("../services/claudeService");

// POST /briefings/run
router.post("/run", async (req, res) => {
  const { topic_id } = req.body;

  if (!topic_id || typeof topic_id !== "string" || !topic_id.trim()) {
    return res.status(400).json({ error: "Missing required field: topic_id" });
  }

  const { data: topic, error: topicError } = await supabase
    .from("topics")
    .select("*")
    .eq("id", topic_id)
    .single();

  if (topicError || !topic) {
    return res.status(404).json({ error: "Topic not found" });
  }

  // Pull seen_urls from the most recent briefing to avoid re-surfacing old results.
  const { data: lastBriefing } = await supabase
    .from("briefings")
    .select("seen_urls")
    .eq("topic_id", topic_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const seenUrls = lastBriefing?.seen_urls ?? [];
  const seenSet = new Set(seenUrls);

  const results = await fetchWebResults(topic.query);
  const filteredResults = results.filter((r) => !seenSet.has(r.url));

  if (filteredResults.length === 0) {
    return res.json({ briefing: null, message: "No new results found since last run." });
  }

  const summary = await generateBriefing(topic.label, filteredResults);

  // Include all fetched URLs (not just new ones) so they are skipped on the next run.
  const updatedSeenUrls = [...new Set([...seenUrls, ...results.map((r) => r.url)])];

  const { data: briefing, error: insertError } = await supabase
    .from("briefings")
    .insert({ topic_id, summary, results: filteredResults, seen_urls: updatedSeenUrls })
    .select()
    .single();

  if (insertError) {
    console.error("Failed to insert briefing:", insertError);
    return res.status(500).json({ error: "Failed to save briefing" });
  }

  return res.status(201).json(briefing);
});

// GET /briefings/:topic_id
router.get("/:topic_id", async (req, res) => {
  const { topic_id } = req.params;

  const { data, error } = await supabase
    .from("briefings")
    .select("*")
    .eq("topic_id", topic_id)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Failed to fetch briefings:", error);
    return res.status(500).json({ error: "Failed to fetch briefings" });
  }

  return res.json(data ?? []);
});

module.exports = router;
