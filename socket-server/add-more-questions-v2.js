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

// Additional questions to reach 50+ per domain
const additionalQuestions = [
    // More Verbal Questions
    {
        question: "What is the meaning of 'Ephemeral'?",
        options: ["Permanent", "Temporary", "Eternal", "Lasting"],
        answer: 1,
        domain: "Verbal"
    },
    {
        question: "Choose the correct spelling:",
        options: ["Necessary", "Necesary", "Neccessary", "Necassary"],
        answer: 0,
        domain: "Verbal"
    },
    {
        question: "What is the antonym of 'Magnanimous'?",
        options: ["Generous", "Petty", "Kind", "Noble"],
        answer: 1,
        domain: "Verbal"
    },
    {
        question: "Complete the idiom: 'Don't count your chickens before they _____'",
        options: ["Hatch", "Grow", "Eat", "Sleep"],
        answer: 0,
        domain: "Verbal"
    },
    {
        question: "What is the synonym of 'Voracious'?",
        options: ["Slow", "Ravenous", "Gentle", "Quiet"],
        answer: 1,
        domain: "Verbal"
    },
    {
        question: "Which word means 'to make something less severe'?",
        options: ["Aggravate", "Alleviate", "Intensify", "Worsen"],
        answer: 1,
        domain: "Verbal"
    },
    {
        question: "What does 'Loquacious' mean?",
        options: ["Quiet", "Talkative", "Angry", "Happy"],
        answer: 1,
        domain: "Verbal"
    },
    {
        question: "Choose the correct preposition: 'She is allergic _____ cats'",
        options: ["to", "for", "with", "by"],
        answer: 0,
        domain: "Verbal"
    },
    {
        question: "What is the meaning of 'Pernicious'?",
        options: ["Helpful", "Harmful", "Neutral", "Beneficial"],
        answer: 1,
        domain: "Verbal"
    },
    {
        question: "Which word is correctly spelled?",
        options: ["Occurence", "Occurrence", "Occurance", "Occurence"],
        answer: 1,
        domain: "Verbal"
    },
    {
        question: "What is the antonym of 'Clandestine'?",
        options: ["Secret", "Open", "Hidden", "Covert"],
        answer: 1,
        domain: "Verbal"
    },
    {
        question: "Complete the phrase: 'The early bird catches the _____'",
        options: ["Worm", "Fish", "Mouse", "Bug"],
        answer: 0,
        domain: "Verbal"
    },
    {
        question: "What does 'Ubiquitous' mean?",
        options: ["Rare", "Everywhere", "Expensive", "Difficult"],
        answer: 1,
        domain: "Verbal"
    },
    {
        question: "Which word means 'to make something better'?",
        options: ["Deteriorate", "Improve", "Worsen", "Damage"],
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
        question: "Choose the correct spelling:",
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
        question: "What is the antonym of 'Humble'?",
        options: ["Modest", "Arrogant", "Simple", "Meek"],
        answer: 1,
        domain: "Verbal"
    },
    {
        question: "Complete the idiom: 'A stitch in time saves _____'",
        options: ["Money", "Nine", "Time", "Effort"],
        answer: 1,
        domain: "Verbal"
    },
    {
        question: "What is the meaning of 'Impetuous'?",
        options: ["Cautious", "Rash", "Slow", "Lazy"],
        answer: 1,
        domain: "Verbal"
    },

    // More Quantitative Questions
    {
        question: "What is 25% of 200?",
        options: ["40", "50", "60", "75"],
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
    {
        question: "What is 15% of 200?",
        options: ["25", "30", "35", "40"],
        answer: 1,
        domain: "Quant"
    },
    {
        question: "If a train travels 120 km in 2 hours, what is its speed?",
        options: ["60 km/h", "50 km/h", "70 km/h", "80 km/h"],
        answer: 0,
        domain: "Quant"
    },
    {
        question: "What is the value of 4² + 5²?",
        options: ["39", "41", "43", "45"],
        answer: 1,
        domain: "Quant"
    },
    {
        question: "If x = 6 and y = 4, what is x² - y²?",
        options: ["18", "20", "22", "24"],
        answer: 1,
        domain: "Quant"
    },
    {
        question: "What is the area of a square with side 6 cm?",
        options: ["30 cm²", "32 cm²", "34 cm²", "36 cm²"],
        answer: 3,
        domain: "Quant"
    },
    {
        question: "If 2x + 5 = 17, what is x?",
        options: ["5", "6", "7", "8"],
        answer: 1,
        domain: "Quant"
    },
    {
        question: "What is the next number in the series: 1, 4, 9, 16, ?",
        options: ["20", "24", "25", "30"],
        answer: 2,
        domain: "Quant"
    },
    {
        question: "If a triangle has base 10 cm and height 6 cm, what is its area?",
        options: ["25 cm²", "30 cm²", "35 cm²", "40 cm²"],
        answer: 1,
        domain: "Quant"
    },
    {
        question: "What is 20% of 150?",
        options: ["25", "30", "35", "40"],
        answer: 1,
        domain: "Quant"
    },
    {
        question: "If a car travels 240 km in 3 hours, what is its speed?",
        options: ["70 km/h", "75 km/h", "80 km/h", "85 km/h"],
        answer: 2,
        domain: "Quant"
    },
    {
        question: "What is the value of 3³ + 2³?",
        options: ["33", "35", "37", "39"],
        answer: 1,
        domain: "Quant"
    },
    {
        question: "If x = 7 and y = 2, what is x² - y²?",
        options: ["43", "45", "47", "49"],
        answer: 1,
        domain: "Quant"
    },

    // More Logical Questions
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
    },
    {
        question: "Find the missing number: 3, 9, 27, ?",
        options: ["54", "72", "81", "90"],
        answer: 2,
        domain: "Logical"
    },
    {
        question: "What is the next number in the series: 1, 1, 2, 3, 5, ?",
        options: ["6", "7", "8", "9"],
        answer: 2,
        domain: "Logical"
    },
    {
        question: "If all cats are animals and some animals are pets, which statement is true?",
        options: ["All cats are pets", "Some cats are pets", "No cats are pets", "Cannot be determined"],
        answer: 3,
        domain: "Logical"
    },
    {
        question: "Complete the pattern: 2, 6, 12, 20, 30, ?",
        options: ["40", "42", "44", "46"],
        answer: 1,
        domain: "Logical"
    },
    {
        question: "What is the missing number: 1, 8, 27, 64, ?",
        options: ["100", "125", "144", "169"],
        answer: 1,
        domain: "Logical"
    },
    {
        question: "If DOG = 26, CAT = 24, what is BAT?",
        options: ["22", "23", "24", "25"],
        answer: 1,
        domain: "Logical"
    },
    {
        question: "What comes next: 1, 3, 6, 10, 15, ?",
        options: ["18", "20", "21", "24"],
        answer: 2,
        domain: "Logical"
    },
    {
        question: "Complete the sequence: 1, 2, 4, 8, 16, ?",
        options: ["24", "28", "32", "36"],
        answer: 2,
        domain: "Logical"
    },
    {
        question: "What is the missing number: 2, 4, 8, 16, 32, ?",
        options: ["48", "56", "64", "72"],
        answer: 2,
        domain: "Logical"
    },
    {
        question: "If all birds can fly and penguins are birds, which statement is true?",
        options: ["All birds are penguins", "Penguins can fly", "Some birds cannot fly", "Cannot be determined"],
        answer: 2,
        domain: "Logical"
    },
    {
        question: "What is the next number in the series: 1, 4, 7, 10, 13, ?",
        options: ["15", "16", "17", "18"],
        answer: 1,
        domain: "Logical"
    },
    {
        question: "Complete the pattern: 1, 4, 9, 16, 25, ?",
        options: ["30", "32", "36", "40"],
        answer: 2,
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














