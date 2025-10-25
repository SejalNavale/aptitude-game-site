import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  // Deployed backend and frontend URLs
  private readonly SOCKET_URL = 'https://aptitude-game-site-backend-wdo1.onrender.com';
  private readonly FRONTEND_URL = 'https://aptitude-game-site-h2je.onrender.com';

  constructor(private ngZone: NgZone) {}

  ngOnInit(): void {
    // Connect to deployed backend (supports WebSocket and fallback polling)
    this.socket = io(this.SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    // Handle connection errors gracefully
    this.socket.on('connect_error', (err: any) => {
      console.error('Socket connection failed:', err?.message || err);
      alert('Cannot connect to quiz server. Please check your network or backend status.');
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket:', this.socket.id);
    });

    // Join Room
    this.socket.emit('joinRoom', { roomCode: this.roomCode, username: this.username }, (res: any) => {
      if (!res.success) alert(res.message || 'Unable to join room');
    });

    // Quiz events
    this.socket.on('quizStarted', (data: any) => this.loadQuestion(data));
    this.socket.on('nextQuestion', (data: any) => this.loadQuestion(data));

    this.socket.on('quizFinished', (data: any) => {
      this.ngZone.run(() => {
        this.quizEnded = true;
        this.finalScores = data.finalScores;
        clearInterval(this.timer);
      });
    });

    // Chat
    this.socket.on('chatUpdate', (msg: any) => {
      this.ngZone.run(() => {
        this.messages.push(msg);
      });
    });
  }

  loadQuestion(data: any): void {
    this.ngZone.run(() => {
      this.currentQuestion = data.question;
      this.currentQuestionIndex = data.index;
      this.selectedAnswer = null;
      this.timeLeft = 30;
      this.startTimer();
    });
  }

  chooseOption(index: number): void {
    if (this.selectedAnswer !== null) return;
    this.selectedAnswer = index;
    this.socket.emit('submitAnswer', {
      roomCode: this.roomCode,
      username: this.username,
      answer: index
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) return;
    this.socket.emit('chatMessage', {
      roomCode: this.roomCode,
      username: this.username,
      message: this.newMessage
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
    if (this.socket) {
      try {
        this.socket.disconnect();
      } catch (err) {
        console.warn('Error disconnecting socket:', err);
      }
    }
  }
}
