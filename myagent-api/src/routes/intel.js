// intel.js — The competitive intelligence route
// This is the core of the new product.
// One company name in → full four-angle brief out.

const express = require('express');
const router = express.Router();
const { fetchCompetitorIntel } = require('../services/nimbleService');
const { generateCompetitorBrief, generateComparisonVerdict } = require('../services/claudeService');
const supabase = require('../services/supabaseClient');

// Runs the full pipeline for one company: fetch live data, generate the
// brief, store it, and return the same shape /analyze and /compare both use.
async function analyzeOne(companyName, userId, context = '') {
  console.log(`[INTEL] Starting analysis for: ${companyName}`);
  const startTime = Date.now();

  const categories = await fetchCompetitorIntel(companyName);
  const report = await generateCompetitorBrief(companyName, categories, context);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`[INTEL] Analysis complete for ${companyName} in ${elapsed}s`);

  const { data, error } = await supabase
    .from('intel_reports')
    .insert({
      company_name: companyName.trim(),
      user_id: userId || 'anonymous',
      report,
      categories,
      elapsed_seconds: parseFloat(elapsed)
    })
    .select()
    .single();

  if (error) {
    // Don't fail the request if storage fails — still return the report
    console.error('Storage failed:', error.message);
  }

  return {
    report,
    categories,
    company_name: companyName,
    elapsed_seconds: parseFloat(elapsed),
    id: data?.id || null,
    created_at: data?.created_at || new Date().toISOString()
  };
}

// POST /intel/analyze
// Body: { company_name, user_id, context }
// Returns: { report, categories, company_name, created_at }
router.post('/analyze', async (req, res, next) => {
  try {
    const { company_name, user_id, context } = req.body;

    if (typeof company_name !== 'string' || !company_name.trim()) {
      return res.status(400).json({ error: 'company_name is required' });
    }

    const result = await analyzeOne(company_name, user_id, context || '');
    res.json(result);

  } catch (err) {
    next(err);
  }
});

// POST /intel/compare
// Body: { company_a, company_b, user_id }
// Returns: { a, b, verdict }
router.post('/compare', async (req, res, next) => {
  try {
    const { company_a, company_b, user_id } = req.body;

    if (typeof company_a !== 'string' || !company_a.trim()) {
      return res.status(400).json({ error: 'company_a is required' });
    }
    if (typeof company_b !== 'string' || !company_b.trim()) {
      return res.status(400).json({ error: 'company_b is required' });
    }

    const [a, b] = await Promise.all([
      analyzeOne(company_a, user_id),
      analyzeOne(company_b, user_id),
    ]);

    const verdict = await generateComparisonVerdict(
      a.company_name, a.report,
      b.company_name, b.report
    );

    res.json({ a, b, verdict });

  } catch (err) {
    next(err);
  }
});

// GET /intel/history/:user_id
// Returns past reports for a user
router.get('/history/:user_id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('intel_reports')
      .select('id, company_name, created_at, elapsed_seconds, report')
      .eq('user_id', req.params.user_id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    next(err);
  }
});

// GET /intel/timeline/:company_name?user_id=...
// Past reports for one company, oldest first — powers the threat-level
// history chart. Degrades to [] on any error (e.g. table not yet created)
// rather than failing the whole report page.
router.get('/timeline/:company_name', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('intel_reports')
      .select('id, created_at, report')
      .ilike('company_name', req.params.company_name.trim())
      .eq('user_id', req.query.user_id || 'anonymous')
      .order('created_at', { ascending: true })
      .limit(20);

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Timeline lookup failed:', err.message);
    res.json([]);
  }
});

// GET /intel/report/:id
// Public — returns a single stored report by id, no ownership check.
// Powers shareable links (myagent.fyi/r/:id).
router.get('/report/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('intel_reports')
      .select('id, company_name, report, categories, elapsed_seconds, created_at')
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
