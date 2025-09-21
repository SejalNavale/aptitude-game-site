// -------------------- Imports --------------------
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

// -------------------- App Setup --------------------
const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: ["http://localhost:4200"], methods: ["GET", "POST"] },
});

// -------------------- MongoDB Connection --------------------
mongoose
    .connect("mongodb://localhost:27017/quizApp")
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

// -------------------- Quiz Settings --------------------
const DEFAULT_QUESTION_TIME = 20;
const REVEAL_TIME = 3000;
let rooms = {};

// -------------------- Socket.io --------------------
io.on("connection", (socket) => {
    console.log("✅ Client connected:", socket.id);

    // ---- Create Room ----
    socket.on("createRoom", async({ username, settings }, callback) => {
        try {
            const roomCode = Math.floor(1000 + Math.random() * 9000).toString();

            let questions = [];
            const maxQuestions = Math.min(settings.numQuestions, 50); // Limit to 50 questions max

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
            callback ? .({ success: true, roomCode, settings: rooms[roomCode].settings });
            io.to(roomCode).emit("roomUpdate", rooms[roomCode]);
            console.log(`🎮 Room ${roomCode} created by ${username}`);
        } catch (err) {
            console.error("❌ Error creating room:", err);
            callback ? .({ success: false, message: "Error creating room" });
        }
    });

    // ---- Join Room ----
    socket.on("joinRoom", ({ roomCode, username }, callback) => {
        const room = rooms[roomCode];
        if (!room) return callback ? .({ success: false, message: "Room not found" });
        if (room.players.find((p) => p.username === username)) {
            return callback ? .({ success: false, message: "Username taken" });
        }

        room.players.push({ username, score: 0, answer: null });
        socket.join(roomCode);
        callback ? .({ success: true, roomCode, settings: room.settings });
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
        player.answerTime = room.timeLeft; // Store remaining time when answered

        // Calculate score based on correctness and speed
        if (player.answer === room.questions[room.currentIndex].answer) {
            const timeBonus = Math.floor((player.answerTime / room.settings.timeLimit) * 50); // Up to 50 bonus points
            const baseScore = 100;
            const totalScore = baseScore + timeBonus;
            player.score += totalScore;

            console.log(`✅ ${username} answered correctly in ${player.answerTime}s: +${totalScore} points (${baseScore} base + ${timeBonus} time bonus)`);
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

    setTimeout(async() => {
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
                    console.log(`💾 Saving score:`, scoreData);
                    await Score.create(scoreData);
                    console.log(`✅ Score saved for ${p.username}: ${p.score} points`);
                } catch (err) {
                    console.error("❌ Error saving score:", err);
                }
            }

            // Clean up room after quiz ends
            delete rooms[roomCode];
        }
    }, REVEAL_TIME);
}

// -------------------- REST APIs --------------------
app.get("/api/questions", async(req, res) => {
    const { domain, limit } = req.query;
    const filter = domain && domain !== "Mixed" ? { domain } : {};
    try {
        const questions = await Question.find(filter).limit(Number(limit) || 10);
        res.json(questions);
    } catch (err) {
        res.status(500).json([]);
    }
});

app.post("/api/score", async(req, res) => {
    const { username, score, domain } = req.body;
    try {
        await Score.create({ username, score, domain });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// Leaderboard API
app.get("/api/leaderboard", async(req, res) => {
    try {
        const leaderboard = await Score.aggregate([{
                $group: {
                    _id: "$username",
                    totalScore: { $sum: "$score" },
                    gamesPlayed: { $sum: 1 },
                    averageScore: { $avg: "$score" }
                }
            },
            {
                $addFields: {
                    averageScore: { $round: ["$averageScore", 0] }
                }
            },
            {
                $sort: { totalScore: -1 }
            }
        ]);
        res.json(leaderboard);
    } catch (err) {
        console.error("Error fetching leaderboard:", err);
        res.status(500).json([]);
    }
});

// Profile API
app.get("/api/profile/:username", async(req, res) => {
    try {
        const { username } = req.params;
        const userStats = await Score.aggregate([
            { $match: { username } },
            {
                $group: {
                    _id: "$username",
                    totalScore: { $sum: "$score" },
                    gamesPlayed: { $sum: 1 },
                    averageScore: { $avg: "$score" }
                }
            },
            {
                $addFields: {
                    averageScore: { $round: ["$averageScore", 0] }
                }
            }
        ]);

        if (userStats.length === 0) {
            return res.json({
                username,
                email: username,
                totalScore: 0,
                gamesPlayed: 0,
                averageScore: 0,
                rank: 0,
                joinDate: new Date().toISOString()
            });
        }

        // Get user's rank
        const allUsers = await Score.aggregate([{
                $group: {
                    _id: "$username",
                    totalScore: { $sum: "$score" }
                }
            },
            { $sort: { totalScore: -1 } }
        ]);

        const userRank = allUsers.findIndex(user => user._id === username) + 1;

        res.json({
            ...userStats[0],
            rank: userRank,
            joinDate: new Date().toISOString()
        });
    } catch (err) {
        console.error("Error fetching profile:", err);
        res.status(500).json({ error: "Failed to fetch profile" });
    }
});

// Update username
app.put("/api/profile/username", async(req, res) => {
    try {
        const { currentUsername, newUsername } = req.body;
        await Score.updateMany({ username: currentUsername }, { $set: { username: newUsername } });
        res.json({ success: true });
    } catch (err) {
        console.error("Error updating username:", err);
        res.status(500).json({ error: "Failed to update username" });
    }
});

// Update password
app.put("/api/profile/password", async(req, res) => {
    try {
        const { username, currentPassword, newPassword } = req.body;
        res.json({ success: true, message: "Password updated successfully" });
    } catch (err) {
        console.error("Error updating password:", err);
        res.status(500).json({ error: "Failed to update password" });
    }
});

// Settings API
app.get("/api/settings/:username", async(req, res) => {
    try {
        res.json({
            notifications: true,
            soundEffects: true,
            theme: 'dark',
            language: 'en',
            autoStart: false,
            defaultTimeLimit: 20,
            defaultQuestions: 10,
            defaultDomain: 'Mixed'
        });
    } catch (err) {
        console.error("Error fetching settings:", err);
        res.status(500).json({ error: "Failed to fetch settings" });
    }
});

app.put("/api/settings", async(req, res) => {
    try {
        const { username, settings } = req.body;
        res.json({ success: true });
    } catch (err) {
        console.error("Error saving settings:", err);
        res.status(500).json({ error: "Failed to save settings" });
    }
});

// -------------------- Start Server --------------------
httpServer.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));