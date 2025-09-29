# Quiz App Setup Guide

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (running on localhost:27017)
- Angular CLI

## Setup Instructions

### 1. Install Dependencies

#### Backend (Socket Server)
```bash
cd socket-server
npm install
```

#### Frontend (Angular App)
```bash
npm install
```

### 2. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# On Windows
net start MongoDB

# On macOS/Linux
sudo systemctl start mongod
```

### 3. Seed the Database
```bash
cd socket-server
node seed-data.js
```

This will create the `quizApp` database with a `questions` collection containing sample questions.

### 4. Start the Backend Server
```bash
cd socket-server
npm start
```

The server will run on `http://localhost:5000`

### 5. Start the Frontend
```bash
ng serve
```

The Angular app will run on `http://localhost:4200`

## Features Implemented

### ✅ Room Management
- Create room with custom settings:
  - Challenge name
  - Domain (Verbal, Logical, Quant, Mixed)
  - Number of questions (1-50)
  - Max players (2-20)
  - Time limit per question (10-120 seconds)
- Join room using generated code
- Real-time player list updates

### ✅ Quiz Flow
- Questions fetched from MongoDB based on selected domain
- Real-time timer countdown
- Answer submission with immediate feedback
- Automatic progression when all players answer or time expires
- Final score calculation and leaderboard

### ✅ Database Integration
- MongoDB connection to `quizApp` database
- Questions stored in `questions` collection
- Scores saved to `scores` collection after quiz completion
- Support for Verbal, Logical, Quant, and Mixed question categories

### ✅ Real-time Features
- Socket.io for real-time communication
- Live leaderboard updates
- Chat functionality
- Answer status tracking

## Database Schema

### Questions Collection
```javascript
{
  _id: ObjectId,
  question: String,
  options: [String], // Array of 4 options
  answer: Number,    // Index of correct answer (0-3)
  domain: String     // "Verbal", "Logical", "Quant", or "Mixed"
}
```

### Scores Collection
```javascript
{
  _id: ObjectId,
  username: String,
  score: Number,
  domain: String,
  createdAt: Date
}
```

## Usage

1. **Create Room**: Set your quiz parameters and click "Create Battleground!"
2. **Share Code**: Copy the generated room code and share with players
3. **Join Room**: Players enter the room code to join
4. **Start Quiz**: Host clicks "Start Quiz!" when ready
5. **Play**: Answer questions within the time limit
6. **Results**: View final scores and leaderboard

## API Endpoints

- `GET /api/questions?domain=Verbal&limit=10` - Get questions by domain
- `POST /api/score` - Save player score

## Socket Events

### Client to Server
- `createRoom` - Create a new quiz room
- `joinRoom` - Join existing room
- `startQuiz` - Start the quiz (host only)
- `submitAnswer` - Submit answer to current question
- `chatMessage` - Send chat message

### Server to Client
- `roomUpdate` - Room state updates
- `quizStarted` - Quiz begins with first question
- `timer` - Timer countdown updates
- `answerSubmitted` - Player answer status
- `questionFinished` - Question results
- `quizFinished` - Final scores and leaderboard
- `chatMessage` - Chat messages

## Troubleshooting

1. **MongoDB Connection Error**: Ensure MongoDB is running on localhost:27017
2. **Socket Connection Failed**: Check if backend server is running on port 5000
3. **No Questions**: Run the seed script to populate the database
4. **CORS Issues**: Backend is configured to allow localhost:4200

## Customization

- Add more questions by running the seed script with additional data
- Modify time limits and scoring in the server configuration
- Customize UI themes in the CSS files
- Add new question domains by updating the domain options

