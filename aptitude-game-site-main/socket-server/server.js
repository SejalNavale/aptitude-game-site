// -------------------- Imports --------------------
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

// -------------------- App Setup --------------------
const app = express();
app.use(cors({
  origin: "http://localhost:4200", // only local Angular frontend
  methods: ["GET", "POST", "PUT"],
  credentials: true
}));
app.use(express.json());

// Root endpoint
app.get("/", (req, res) => {
  res.send("✅ Server started successfully!");
  console.log("Server is running...");
});

// -------------------- MongoDB Connection --------------------
mongoose
  .connect("mongodb+srv://ayushshirke123_db_user:IIT_project@quizappcluster.hnwrp1w.mongodb.net/IIT_project?retryWrites=true&w=majority&appName=QuizAppCluster")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// -------------------- Schemas --------------------
const questionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  answer: Number,
  domain: String,
});
const Question = mongoose.model("Question", questionSchema);

const scoreSchema = new mongoose.Schema({
  username: String,
  score: Number,
  domain: String,
  createdAt: { type: Date, default: Date.now },
});
const Score = mongoose.model("Score", scoreSchema);

const settingsSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  notifications: { type: Boolean, default: true },
  soundEffects: { type: Boolean, default: true },
  theme: { type: String, default: "dark" },
  language: { type: String, default: "en" },
  autoStart: { type: Boolean, default: false },
  defaultTimeLimit: { type: Number, default: 20 },
  defaultQuestions: { type: Number, default: 10 },
  defaultDomain: { type: String, default: "Mixed" },
});
const UserSettings = mongoose.model("UserSettings", settingsSchema);

// -------------------- Quiz Logic Setup --------------------
const DEFAULT_QUESTION_TIME = 20;
const REVEAL_TIME = 3000;
let rooms = {};

// -------------------- HTTP & Socket Setup --------------------
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:4200", // only local Angular frontend
    methods: ["GET", "POST", "PUT"],
    credentials: true
  }
});

// -------------------- Socket.io Events --------------------
io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);

  // ---- Create Room ----
  socket.on("createRoom", async ({ username, settings }, callback) => {
    try {
      const roomCode = Math.floor(1000 + Math.random() * 9000).toString();
      const maxQuestions = Math.min(settings.numQuestions, 50);
      let questions = [];

      if (settings.domain === "Mixed") {
        questions = await Question.aggregate([{ $sample: { size: maxQuestions } }]);
      } else {
        questions = await Question.find({ domain: settings.domain }).limit(maxQuestions);
      }

      rooms[roomCode] = {
        roomCode,
        owner: username,
        players: [{ username, score: 0, answer: null }],
        currentIndex: 0,
        questions,
        settings: {
          ...settings,
          numQuestions: questions.length,
          timeLimit: settings.timeLimit || DEFAULT_QUESTION_TIME,
        },
        timeLeft: settings.timeLimit || DEFAULT_QUESTION_TIME,
        timerInterval: null,
        timerTimeout: null,
        isStarted: false,
      };

      socket.join(roomCode);
      callback?.({ success: true, roomCode, settings: rooms[roomCode].settings });
      io.to(roomCode).emit("roomUpdate", rooms[roomCode]);
    } catch (err) {
      console.error("❌ Error creating room:", err);
      callback?.({ success: false, message: "Error creating room" });
    }
  });

  // ---- Join Room ----
  socket.on("joinRoom", ({ roomCode, username }, callback) => {
    const room = rooms[roomCode];
    if (!room) return callback?.({ success: false, message: "Room not found" });
    if (room.players.find((p) => p.username === username)) {
      return callback?.({ success: false, message: "Username taken" });
    }

    room.players.push({ username, score: 0, answer: null });
    socket.join(roomCode);
    callback?.({ success: true, roomCode, settings: room.settings });
    io.to(roomCode).emit("roomUpdate", room);
  });

  // ---- Start Quiz ----
  socket.on("startQuiz", ({ roomCode, username }) => {
    const room = rooms[roomCode];
    if (!room || room.owner !== username) return;
    room.currentIndex = 0;
    room.isStarted = true;
    sendQuestion(roomCode);
  });

  // ---- Submit Answer ----
  socket.on("submitAnswer", ({ roomCode, username, answer }) => {
    const room = rooms[roomCode];
    if (!room) return;

    const player = room.players.find((p) => p.username === username);
    if (!player || player.answer !== null) return;

    player.answer = Number(answer);
    player.answerTime = room.timeLeft;

    if (player.answer === room.questions[room.currentIndex].answer) {
      const timeBonus = Math.floor((player.answerTime / room.settings.timeLimit) * 50);
      const totalScore = 100 + timeBonus;
      player.score += totalScore;
    }

    io.to(roomCode).emit("answerSubmitted", {
      currentAnswers: Object.fromEntries(room.players.map((p) => [p.username, p.answer])),
      players: room.players,
      player: username,
    });

    if (room.players.every((p) => p.answer !== null)) {
      finishQuestion(roomCode);
    }
  });

  socket.on("chatMessage", ({ roomCode, username, message }) => {
    const msg = `${username}: ${message}`;
    io.to(roomCode).emit("chatMessage", msg);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// -------------------- Helper Functions --------------------
function sendQuestion(roomCode) {
  const room = rooms[roomCode];
  if (!room) return;

  const q = room.questions[room.currentIndex];
  if (!q) {
    console.error(`❌ No question found at index ${room.currentIndex} for room ${roomCode}`);
    io.to(roomCode).emit("error", { message: "No questions available" });
    return;
  }

  room.players.forEach((p) => (p.answer = null));
  room.timeLeft = room.settings.timeLimit;

  io.to(roomCode).emit("quizStarted", {
    currentQuestionIndex: room.currentIndex,
    currentQuestion: q.question,
    currentOptions: q.options,
    numQuestions: room.settings.numQuestions,
    players: room.players,
    timeLimit: room.settings.timeLimit,
  });

  clearInterval(room.timerInterval);
  clearTimeout(room.timerTimeout);

  room.timerInterval = setInterval(() => {
    room.timeLeft--;
    io.to(roomCode).emit("timer", room.timeLeft);
  }, 1000);

  room.timerTimeout = setTimeout(() => finishQuestion(roomCode), room.settings.timeLimit * 1000);
}

async function finishQuestion(roomCode) {
  const room = rooms[roomCode];
  if (!room) return;

  clearInterval(room.timerInterval);
  clearTimeout(room.timerTimeout);

  io.to(roomCode).emit("questionFinished", {
    correctAnswer: room.questions[room.currentIndex].answer,
    players: room.players,
  });

  setTimeout(async () => {
    room.currentIndex++;
    if (room.currentIndex < room.questions.length) {
      sendQuestion(roomCode);
    } else {
      io.to(roomCode).emit("quizFinished", { finalScores: room.players });
      for (const p of room.players) {
        try {
          await Score.create({
            username: p.username,
            score: p.score,
            domain: room.settings.domain,
          });
        } catch (err) {
          console.error("❌ Error saving score:", err);
        }
      }
      delete rooms[roomCode];
    }
  }, REVEAL_TIME);
}

// -------------------- REST APIs --------------------
// Questions API
app.get("/api/questions", async (req, res) => {
  const { domain, limit } = req.query;
  const filter = domain && domain !== "Mixed" ? { domain } : {};
  try {
    const questions = await Question.find(filter).limit(Number(limit) || 10);
    res.json(questions);
  } catch {
    res.status(500).json([]);
  }
});

// Settings API
app.get("/api/settings/:username", async (req, res) => {
  try {
    const { username } = req.params;
    let doc = await UserSettings.findOne({ username });
    if (!doc) {
      doc = await UserSettings.create({ username });
    }
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

app.put("/api/settings", async (req, res) => {
  try {
    const { username, settings } = req.body;
    if (!username || !settings) return res.status(400).json({ error: "Invalid payload" });
    await UserSettings.updateOne({ username }, { $set: { ...settings, username } }, { upsert: true });
    const saved = await UserSettings.findOne({ username });
    res.json({ success: true, settings: saved });
  } catch (err) {
    res.status(500).json({ error: "Failed to save settings" });
  }
});

// -------------------- Start Server --------------------
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
