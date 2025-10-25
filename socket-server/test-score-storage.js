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

async function testScoreStorage() {
    try {
        console.log('🧪 Testing score storage...');

        // Test saving a score
        const testScore = await Score.create({
            username: 'TestPlayer',
            score: 850,
            domain: 'Mixed'
        });

        console.log('✅ Test score saved:', testScore);

        // Test retrieving scores
        const scores = await Score.find({});
        console.log('📊 All scores in database:');
        scores.forEach(score => {
            console.log(`  - ${score.username}: ${score.score} points (${score.domain})`);
        });

        // Test leaderboard aggregation
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

        console.log('🏆 Leaderboard:');
        leaderboard.forEach((player, index) => {
            console.log(`  ${index + 1}. ${player._id}: ${player.totalScore} points (${player.gamesPlayed} games, avg: ${player.averageScore})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error testing score storage:', error);
        process.exit(1);
    }
}

testScoreStorage();














