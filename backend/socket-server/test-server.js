const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb+srv://ayushshirke123_db_user:IIT_project@quizappcluster.hnwrp1w.mongodb.net/quizrush?retryWrites=true&w=majority&appName=QuizAppCluster');

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
        // Test saving a score
        const testScore = await Score.create({
            username: 'TestPlayer',
            score: 850,
            domain: 'Mixed'
        });

        console.log('✅ Test score saved:', testScore);

        // Test retrieving scores
        const scores = await Score.find({});
        console.log('📊 All scores in database:', scores);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error testing score storage:', error);
        process.exit(1);
    }
}

testScoreStorage();
