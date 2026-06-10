require("dotenv").config();

const express = require("express");
const cors = require("cors");
const topicsRouter = require("./src/routes/topics");
const briefingsRouter = require("./src/routes/briefings");
const intelRouter = require("./src/routes/intel");
const requestLogger = require("./src/middleware/logger");


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

// DEBUG ROUTES — remove before submitting to Devpost
app.get('/debug/nimble', async (req, res) => {
  const { fetchWebResults } = require('./src/services/nimbleService');
  try {
    const results = await fetchWebResults(req.query.q || 'AI tools 2026');
    res.json({ ok: true, count: results.length, results });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get('/debug/groq', async (req, res) => {
  const { generateBriefing } = require('./src/services/claudeService');
  try {
    const fakeResults = [
      { title: 'Test article', url: 'https://example.com', snippet: 'This is a test snippet about AI tools.' }
    ];
    const briefing = await generateBriefing('test topic', fakeResults);
    res.json({ ok: true, briefing });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.use("/topics", topicsRouter);
app.use("/briefings", briefingsRouter);
app.use("/intel", intelRouter);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status ?? 500).json({ error: err.message });
});

const server = app.listen(PORT, () => {
  console.log(`myagent-api running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is busy, retrying...`);
    setTimeout(() => {
      server.close();
      server.listen(PORT);
    }, 1000);
  } else {
    throw err;
  }
});
