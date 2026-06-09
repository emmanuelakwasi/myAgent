
CREATE TABLE users (
  id         text        PRIMARY KEY,           -- user's email, sent directly from the frontend
  created_at timestamptz DEFAULT now() NOT NULL
);


CREATE TABLE topics (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    text        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label      text        NOT NULL,  -- display name, e.g. "My startup"
  query      text        NOT NULL,  -- search string passed to Nimble, e.g. "YourStartup.com reviews"
  created_at timestamptz DEFAULT now() NOT NULL
);



CREATE TABLE briefings (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id   uuid        NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  summary    text,        -- AI-written paragraph produced by Claude
  results    jsonb,       -- raw array of Nimble result objects, rendered as cards in the frontend
  seen_urls  jsonb        DEFAULT '[]'::jsonb,  -- deduplication list; URLs here are skipped on the next run
  created_at timestamptz DEFAULT now() NOT NULL
);
