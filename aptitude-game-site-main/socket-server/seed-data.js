const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect("mongodb+srv://ayushshirke123_db_user:IIT_project@quizappcluster.hnwrp1w.mongodb.net/IIT_project?retryWrites=true&w=majority&appName=QuizAppCluster");

// Define schema
const questionSchema = new mongoose.Schema({
    question: String,
    options: [String],
    answer: Number,
    domain: String,
});

const Question = mongoose.model('Question', questionSchema);

// Sample questions data
const sampleQuestions = [{
        question: "Select the synonym of 'Impetuous'.",
        options: ["Cautious", "Rash", "Slow", "Lazy"],
        answer: 1,
        domain: "Verbal"
    },
    {
        question: "Choose the antonym of 'Humble'.",
        options: ["Modest", "Arrogant", "Simple", "Meek"],
        answer: 1,
        domain: "Verbal"
    },
    {
        question: "If x + y = 15 and x - y = 5, find x and y.",
        options: ["10 and 5", "12 and 3", "8 and 7", "9 and 6"],
        answer: 0,
        domain: "Quant"
    },
    {
        question: "Find the missing number: 3, 9, 27, ?",
        options: ["54", "72", "81", "90"],
        answer: 2,
        domain: "Logical"
    },
    {
        question: "What is the next number in the series: 2, 4, 8, 16, ?",
        options: ["24", "32", "28", "20"],
        answer: 1,
        domain: "Logical"
    },
    {
        question: "If a train travels 120 km in 2 hours, what is its speed?",
        options: ["60 km/h", "50 km/h", "70 km/h", "80 km/h"],
        answer: 0,
        domain: "Quant"
    },
    {
        question: "Which word means 'to make something better'?",
        options: ["Deteriorate", "Improve", "Worsen", "Damage"],
        answer: 1,
        domain: "Verbal"
    },
    {
        question: "Complete the pattern: A, C, E, G, ?",
        options: ["H", "I", "J", "K"],
        answer: 1,
        domain: "Logical"
    },
    {
        question: "What is 25% of 200?",
        options: ["40", "50", "60", "75"],
        answer: 1,
        domain: "Quant"
    },
    {
        question: "Which is the correct spelling?",
        options: ["Accomodate", "Accommodate", "Acommodate", "Accomadate"],
        answer: 1,
        domain: "Verbal"
    }
];

async function seedDatabase() {
    try {
        // Clear existing questions
        await Question.deleteMany({});
        console.log('✅ Cleared existing questions');

        // Insert sample questions
        await Question.insertMany(sampleQuestions);
        console.log('✅ Inserted sample questions');

        console.log('🎉 Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();