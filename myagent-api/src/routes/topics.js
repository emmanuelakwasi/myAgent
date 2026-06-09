const express = require("express");
const router = express.Router();
const supabase = require("../services/supabaseClient");

// POST /topics
router.post("/", async (req, res) => {
  const { user_id, label, query } = req.body;

  for (const [field, value] of [["user_id", user_id], ["label", label], ["query", query]]) {
    if (!value || typeof value !== "string" || !value.trim()) {
      return res.status(400).json({ error: `Missing required field: ${field}` });
    }
  }

  // Ensure the user row exists before inserting the topic — topics.user_id
  // is a FK to users.id, so the insert would fail with a constraint violation
  // if the user has never been seen before. ignoreDuplicates avoids a no-op error
  // on subsequent calls for the same user.
  const { error: userError } = await supabase
    .from("users")
    .upsert({ id: user_id.trim() }, { onConflict: "id", ignoreDuplicates: true });

  if (userError) {
    console.error("Failed to upsert user:", userError);
    return res.status(500).json({ error: "Failed to resolve user" });
  }

  const { data, error } = await supabase
    .from("topics")
    .insert({ user_id: user_id.trim(), label: label.trim(), query: query.trim() })
    .select()
    .single();

  if (error) {
    console.error("Failed to create topic:", error);
    return res.status(500).json({ error: "Failed to create topic" });
  }

  return res.status(201).json(data);
});

// GET /topics/:user_id
router.get("/:user_id", async (req, res) => {
  const { user_id } = req.params;

  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch topics:", error);
    return res.status(500).json({ error: "Failed to fetch topics" });
  }

  return res.json(data ?? []);
});

// DELETE /topics/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  // Briefings are deleted automatically via ON DELETE CASCADE defined in schema.sql.
  const { error } = await supabase.from("topics").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete topic:", error);
    return res.status(500).json({ error: "Failed to delete topic" });
  }

  return res.json({ deleted: true });
});

module.exports = router;
