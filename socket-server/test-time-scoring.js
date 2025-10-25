const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/quizApp');

// Define schema
const scoreSchema = new mongoose.Schema({
    username: String,
    score: Number,
    domain: String,
    createdAt: { type: Date, default: Date.now },
});

const Score = mongoose.model('Score', scoreSchema);

async function testTimeScoring() {
    try {
        console.log('🧪 Testing time-based scoring system...');

        // Simulate different response times for the same question
        const timeLimit = 20; // 20 seconds per question

        // Player 1: Answered correctly in 5 seconds (fast)
        const timeBonus1 = Math.floor((15 / timeLimit) * 50); // 15 seconds remaining
        const score1 = 100 + timeBonus1; // 100 base + 37 time bonus = 137 points

        // Player 2: Answered correctly in 15 seconds (slow)
        const timeBonus2 = Math.floor((5 / timeLimit) * 50); // 5 seconds remaining
        const score2 = 100 + timeBonus2; // 100 base + 12 time bonus = 112 points

        // Player 3: Answered incorrectly (0 points)
        const score3 = 0;

        console.log(`⚡ Fast player (5s): ${score1} points (100 base + ${timeBonus1} time bonus)`);
        console.log(`🐌 Slow player (15s): ${score2} points (100 base + ${timeBonus2} time bonus)`);
        console.log(`❌ Wrong answer: ${score3} points`);

        // Test saving scores
        const testScores = [
            { username: 'FastPlayer', score: score1, domain: 'Mixed' },
            { username: 'SlowPlayer', score: score2, domain: 'Mixed' },
            { username: 'WrongPlayer', score: score3, domain: 'Mixed' }
        ];

        for (const scoreData of testScores) {
            await Score.create(scoreData);
            console.log(`✅ Saved score: ${scoreData.username} - ${scoreData.score} points`);
        }

        // Test leaderboard
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

        console.log('\n🏆 Leaderboard (sorted by total score):');
        leaderboard.forEach((player, index) => {
            console.log(`  ${index + 1}. ${player._id}: ${player.totalScore} points (${player.gamesPlayed} games, avg: ${player.averageScore})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error testing time scoring:', error);
        process.exit(1);
    }
}

testTimeScoring();














