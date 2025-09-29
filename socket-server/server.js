// -------------------- Imports --------------------
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

// -------------------- App Setup --------------------
const app = express();
app.use(
    cors({
        origin: ["http://localhost:4200", "https://aptitude-game-site-qhe3.vercel.app"],
        methods: ["GET", "POST", "PUT"],
    })
);
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:4200", "https://aptitude-game-site-qhe3.vercel.app"],
        methods: ["GET", "POST"],
    },
});

// -------------------- MongoDB Connection --------------------
mongoose
    .connect(process.env.MONGO_URI || "mongodb://localhost:27017/quizApp")
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

// -------------------- Quiz Settings --------------------
const DEFAULT_QUESTION_TIME = 20;
const REVEAL_TIME = 3000;
let rooms = {};

// -------------------- Socket.io --------------------
io.on("connection", (socket) => {
    console.log("✅ Client connected:", socket.id);

    // ---- Create Room ----
    socket.on("createRoom", async ({ username, settings }, callback) => {
        try {
            const roomCode = Math.floor(1000 + Math.random() * 9000).toString();

            let questions = [];
            const maxQuestions = Math.min(settings.numQuestions, 50);

            console.log(`🎯 Fetching ${maxQuestions} questions for domain: ${settings.domain}`);

            if (settings.domain === "Mixed") {
                questions = await Question.aggregate([{ $sample: { size: maxQuestions } }]);
            } else {
                questions = await Question.find({ domain: settings.domain }).limit(maxQuestions);
            }

            console.log(`📚 Found ${questions.length} questions in database`);

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
            console.log(`🎮 Room ${roomCode} created by ${username}`);
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
            const baseScore = 100;
            const totalScore = baseScore + timeBonus;
            player.score += totalScore;

            console.log(`✅ ${username} answered correctly in ${player.answerTime}s: +${totalScore} points`);
        } else {
            console.log(`❌ ${username} answered incorrectly: 0 points`);
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

    // ---- Chat ----
    socket.on("chatMessage", ({ roomCode, username, message }) => {
        const msg = `${username}: ${message}`;
        io.to(roomCode).emit("chatMessage", msg);
    });

    // ---- Disconnect ----
    socket.on("disconnect", () => {
        console.log("❌ Client disconnected:", socket.id);
    });
});

// -------------------- Helpers --------------------
function sendQuestion(roomCode) {
    const room = rooms[roomCode];
    if (!room) return;

    const q = room.questions[room.currentIndex];
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

function finishQuestion(roomCode) {
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

            // Save scores to MongoDB
            console.log(`💾 Saving scores for ${room.players.length} players`);
            for (const p of room.players) {
                try {
                    const scoreData = {
                        username: p.username,
                        score: p.score,
                        domain: room.settings.domain,
                    };
                    await Score.create(scoreData);
                    console.log(`✅ Score saved for ${p.username}: ${p.score} points`);
                } catch (err) {
                    console.error("❌ Error saving score:", err);
                }
            }

            delete rooms[roomCode];
        }
    }, REVEAL_TIME);
}

// -------------------- REST APIs --------------------
// (same as your original – unchanged)

// -------------------- Start Server --------------------
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
