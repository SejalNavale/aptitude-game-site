import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

const socket = io('https://aptitude-game-site-backend.onrender.com', {
  withCredentials: true
});
@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent implements OnInit, OnDestroy {
  socket!: Socket;
  roomCode: string = '1234'; // later dynamic
  username: string = 'Sakshi'; // later dynamic

  currentQuestion: any = null;
  currentQuestionIndex: number = 0;
  timeLeft: number = 30;
  timer: any;
  selectedAnswer: number | null = null;
  quizEnded: boolean = false;
  finalScores: any[] = [];

  messages: { username: string; message: string }[] = [];
  newMessage: string = '';

  constructor(private ngZone: NgZone) {}

  ngOnInit(): void {
    // ✅ Use proxy path for Socket.io connection
    this.socket = io('https://aptitude-game-site-backend.onrender.com', {
  withCredentials: true,
  path: '/socket.io',      // matches your server config
  transports: ['websocket']
});

    // Join Room
    this.socket.emit('joinRoom', { roomCode: this.roomCode, username: this.username }, (res: any) => {
      if (!res.success) alert(res.message);
    });

    // Quiz events
    this.socket.on('quizStarted', (data: any) => this.loadQuestion(data));
    this.socket.on('nextQuestion', (data: any) => this.loadQuestion(data));
    this.socket.on('quizFinished', (data: any) => {
      this.quizEnded = true;
      this.finalScores = data.finalScores;
      clearInterval(this.timer);
    });

    // Chat
    this.socket.on('chatUpdate', (msg: any) => {
      this.ngZone.run(() => {
        this.messages.push(msg);
      });
    });
  }

  loadQuestion(data: any): void {
    this.currentQuestion = data.question;
    this.currentQuestionIndex = data.index;
    this.selectedAnswer = null;
    this.timeLeft = 30;
    this.startTimer();
  }

  chooseOption(index: number): void {
    if (this.selectedAnswer !== null) return;
    this.selectedAnswer = index;
    this.socket.emit('submitAnswer', {
      roomCode: this.roomCode,
      username: this.username,
      answer: index,
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) return;
    this.socket.emit('chatMessage', {
      roomCode: this.roomCode,
      username: this.username,
      message: this.newMessage,
    });
    this.newMessage = '';
  }

  startTimer(): void {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
    if (this.socket) this.socket.disconnect();
  }
}
