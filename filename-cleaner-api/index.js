require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const { buildCleanFilename } = require("./src/cleaner");

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ ok: true, message: "Filename Cleaner API running" });
});

function todayDate() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

app.post("/clean", async (req, res) => {
  try {
    const {
      userId,
      rawFilename,
      niche,
      title,
      template,
      caseStyle,
      removeWords,
      useEpisode = false
    } = req.body;

    if (!userId || !rawFilename) {
      return res.status(400).json({ error: "userId and rawFilename are required" });
    }

    // load user's latest template if not provided
    let chosenTemplate = template;
    let chosenCaseStyle = caseStyle;
    let chosenRemoveWords = removeWords;

    if (!chosenTemplate || !chosenCaseStyle || !chosenRemoveWords) {
      const latestTemplate = await prisma.template.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" }
      });

      if (latestTemplate) {
        chosenTemplate = chosenTemplate || latestTemplate.template;
        chosenCaseStyle = chosenCaseStyle || latestTemplate.caseStyle;
        chosenRemoveWords = chosenRemoveWords || latestTemplate.removeWords;
      }
    }

    chosenTemplate = chosenTemplate || "{title}_{date}";
    chosenCaseStyle = chosenCaseStyle || "snake";
    chosenRemoveWords = chosenRemoveWords || undefined;

    // episode counter
    let episodeNumber = null;
    if (useEpisode && niche) {
      const counter = await prisma.episodeCounter.upsert({
        where: { userId_niche: { userId, niche } },
        update: { lastEp: { increment: 1 } },
        create: { userId, niche, lastEp: 1 }
      });
      episodeNumber = counter.lastEp;
    }

    const cleanFilename = buildCleanFilename({
      rawFilename,
      template: chosenTemplate,
      caseStyle: chosenCaseStyle,
      removeWords: chosenRemoveWords,
      niche,
      title,
      episode: episodeNumber,
      date: todayDate()
    });

    res.json({
      cleanFilename,
      used: {
        template: chosenTemplate,
        caseStyle: chosenCaseStyle,
        episode: episodeNumber
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});
// 1) create user
app.post("/users", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.create({ data: { email } });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2) save template
app.post("/templates", async (req, res) => {
  try {
    const { userId, template, caseStyle, removeWords } = req.body;

    if (!userId || !template || !caseStyle) {
      return res.status(400).json({
        error: "userId, template, caseStyle are required"
      });
    }

    const saved = await prisma.template.create({
      data: {
        userId,
        template,
        caseStyle,
        removeWords: removeWords || []
      }
    });

    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3) get templates
app.get("/templates/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const templates = await prisma.template.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });

    res.json(templates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
