const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/quizApp');

// Define schema
const questionSchema = new mongoose.Schema({
    question: String,
    options: [String],
    answer: Number,
    domain: String,
});

const Question = mongoose.model('Question', questionSchema);

// Additional questions data
const additionalQuestions = [
    // Verbal Questions
    {
        question: "What is the meaning of 'Ubiquitous'?",
        options: ["Rare", "Everywhere", "Expensive", "Difficult"],
        answer: 1,
        domain: "Verbal"
    },
    {
        question: "Choose the correct spelling:",
        options: ["Occasion", "Ocasion", "Occassion", "Occasoin"],
        answer: 0,
        domain: "Verbal"
    },
    {
        question: "What is the antonym of 'Benevolent'?",
        options: ["Kind", "Generous", "Malevolent", "Charitable"],
        answer: 2,
        domain: "Verbal"
    },
    {
        question: "Complete the idiom: 'A stitch in time saves _____'",
        options: ["Money", "Nine", "Time", "Effort"],
        answer: 1,
        domain: "Verbal"
    },
    {
        question: "What is the synonym of 'Pragmatic'?",
        options: ["Idealistic", "Practical", "Theoretical", "Abstract"],
        answer: 1,
        domain: "Verbal"
    },
    {
        question: "Which word is correctly spelled?",
        options: ["Accomodate", "Accommodate", "Acommodate", "Accomadate"],
        answer: 1,
        domain: "Verbal"
    },
    {
        question: "What does 'Serendipity' mean?",
        options: ["Bad luck", "Good fortune", "Hard work", "Intelligence"],
        answer: 1,
        domain: "Verbal"
    },
    {
        question: "Choose the correct preposition: 'He is good _____ mathematics'",
        options: ["at", "in", "on", "for"],
        answer: 0,
        domain: "Verbal"
    },

    // Quantitative Questions
    {
        question: "What is 15% of 200?",
        options: ["25", "30", "35", "40"],
        answer: 1,
        domain: "Quant"
    },
    {
        question: "If a train travels 300 km in 4 hours, what is its speed?",
        options: ["70 km/h", "75 km/h", "80 km/h", "85 km/h"],
        answer: 1,
        domain: "Quant"
    },
    {
        question: "What is the value of 2³ + 3²?",
        options: ["15", "17", "19", "21"],
        answer: 1,
        domain: "Quant"
    },
    {
        question: "If x = 5 and y = 3, what is x² - y²?",
        options: ["16", "18", "20", "22"],
        answer: 0,
        domain: "Quant"
    },
    {
        question: "What is the area of a circle with radius 7 cm? (π = 22/7)",
        options: ["154 cm²", "154 cm²", "154 cm²", "154 cm²"],
        answer: 0,
        domain: "Quant"
    },
    {
        question: "If 3x + 7 = 22, what is x?",
        options: ["4", "5", "6", "7"],
        answer: 1,
        domain: "Quant"
    },
    {
        question: "What is the next number in the series: 2, 6, 12, 20, ?",
        options: ["28", "30", "32", "34"],
        answer: 1,
        domain: "Quant"
    },
    {
        question: "If a rectangle has length 8 cm and width 5 cm, what is its perimeter?",
        options: ["26 cm", "28 cm", "30 cm", "32 cm"],
        answer: 0,
        domain: "Quant"
    },

    // Logical Questions
    {
        question: "Complete the pattern: A, D, G, J, ?",
        options: ["K", "L", "M", "N"],
        answer: 2,
        domain: "Logical"
    },
    {
        question: "If all roses are flowers and some flowers are red, which statement is true?",
        options: ["All roses are red", "Some roses are red", "No roses are red", "Cannot be determined"],
        answer: 3,
        domain: "Logical"
    },
    {
        question: "What comes next: 1, 4, 9, 16, ?",
        options: ["20", "24", "25", "30"],
        answer: 2,
        domain: "Logical"
    },
    {
        question: "If Monday is the 1st, what day is the 15th?",
        options: ["Monday", "Tuesday", "Wednesday", "Thursday"],
        answer: 0,
        domain: "Logical"
    },
    {
        question: "Complete the sequence: 2, 4, 8, 16, ?",
        options: ["24", "28", "32", "36"],
        answer: 2,
        domain: "Logical"
    },
    {
        question: "If RED = 18, BLUE = 21, what is GREEN?",
        options: ["25", "30", "35", "40"],
        answer: 2,
        domain: "Logical"
    },
    {
        question: "What is the missing number: 5, 10, 20, 40, ?",
        options: ["60", "70", "80", "90"],
        answer: 2,
        domain: "Logical"
    },
    {
        question: "If A = 1, B = 2, C = 3, what is the value of CAT?",
        options: ["24", "25", "26", "27"],
        answer: 0,
        domain: "Logical"
    }
];

async function addMoreQuestions() {
    try {
        // Add additional questions
        await Question.insertMany(additionalQuestions);
        console.log('✅ Added more questions to database');

        // Count total questions
        const totalQuestions = await Question.countDocuments();
        console.log(`📊 Total questions in database: ${totalQuestions}`);

        // Count by domain
        const verbalCount = await Question.countDocuments({ domain: 'Verbal' });
        const quantCount = await Question.countDocuments({ domain: 'Quant' });
        const logicalCount = await Question.countDocuments({ domain: 'Logical' });

        console.log(`📈 Questions by domain:`);
        console.log(`   Verbal: ${verbalCount}`);
        console.log(`   Quant: ${quantCount}`);
        console.log(`   Logical: ${logicalCount}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding questions:', error);
        process.exit(1);
    }
}

addMoreQuestions();
