// We export one client instance and import it everywhere else.
// Supabase handles the connection pooling.

const { createClient } = require("@supabase/supabase-js");
const ws = require("ws");

// Node 20 has no native WebSocket — pass the ws package so the Supabase
// realtime client initializes without throwing, even though we don't use
// realtime subscriptions anywhere in this project.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  { realtime: { transport: ws } }
);

module.exports = supabase;
