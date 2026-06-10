-- Optional: seed demo history for the "Threat level over time" chart.
--
-- Run this AFTER creating the intel_reports table (see schema.sql).
-- Replace the two placeholders below, then run in the Supabase SQL editor:
--   'YourDemoCompany'       -> the exact company name you'll type during the demo
--                              (matching is case-insensitive)
--   'your-demo-user@email'  -> the user_id (email) you'll be logged in as
--
-- This inserts 4 backdated reports spanning ~3 weeks with a rising threat
-- level (LOW -> MEDIUM -> MEDIUM -> HIGH). Live-analyzing the same company
-- during the demo adds a 5th "today" point, completing the trend.

INSERT INTO intel_reports (company_name, user_id, report, created_at) VALUES

('YourDemoCompany', 'your-demo-user@email',
$$REPUTATION
Reviews are largely positive, with users praising ease of onboarding and responsive support. A few complaints mention occasional sync delays.

PRODUCT
Shipped a minor UI refresh and two integrations this month. No major strategic shifts announced.

GROWTH
Hiring has been steady but modest, with a handful of open roles in engineering and sales.

PRESS
Coverage has been quiet, limited to a couple of product round-up mentions.

STRATEGIC TAKE
No urgent action needed. Keep monitoring for any pricing or product direction changes.

THREAT LEVEL
LOW
Stable product and modest growth signal a low near-term competitive threat.$$,
now() - interval '21 days'),

('YourDemoCompany', 'your-demo-user@email',
$$REPUTATION
Sentiment has held steady, though a recent pricing change drew some pushback on social media.

PRODUCT
Announced a new integration and a revamped onboarding flow, signaling investment in growth.

GROWTH
Job postings have roughly doubled, concentrated in product and go-to-market roles.

PRESS
A funding rumor and a positive trade-press writeup gave the company a visibility bump.

STRATEGIC TAKE
Worth tracking closely. The hiring uptick and product investment suggest a push for market share.

THREAT LEVEL
MEDIUM
Accelerating hiring and product investment raise this from a low to a moderate threat.$$,
now() - interval '14 days'),

('YourDemoCompany', 'your-demo-user@email',
$$REPUTATION
Reviews remain mostly positive, with the new onboarding flow getting favorable mentions.

PRODUCT
Shipped the integration teased two weeks ago, plus a public roadmap signaling further releases.

GROWTH
Continued hiring across engineering and sales, with a new regional office announced.

PRESS
Multiple outlets covered the roadmap announcement; coverage skews positive.

STRATEGIC TAKE
Momentum is building. Competitors should benchmark the new integration and roadmap closely.

THREAT LEVEL
MEDIUM
Sustained hiring and a public roadmap keep this at a moderate, rising threat level.$$,
now() - interval '7 days'),

('YourDemoCompany', 'your-demo-user@email',
$$REPUTATION
Praise for the new release has driven a noticeable uptick in positive reviews and social mentions.

PRODUCT
Announced a major new product line, expanding well beyond their original core offering.

GROWTH
Hiring has surged further, including senior leadership additions in new market segments.

PRESS
Heavy press coverage of the new product line, with several outlets calling it a category shift.

STRATEGIC TAKE
This is an inflection point. Competitors should reassess roadmap priorities in light of the new product line now, not next quarter.

THREAT LEVEL
HIGH
A major product expansion plus accelerated hiring marks a significant near-term competitive threat.$$,
now() - interval '1 day');

-- To remove this seed data afterward:
-- DELETE FROM intel_reports WHERE company_name ILIKE 'YourDemoCompany' AND user_id = 'your-demo-user@email';
