import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { io, Socket } from 'socket.io-client';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../core/auth.service';

const API_URL = 'https://aptitude-game-backend.onrender.com/api';
const SOCKET_URL = 'https://aptitude-game-backend.onrender.com';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit, OnDestroy {
  socket!: Socket;

  private auth = inject(AuthService);
  username = '';
  roomCode = '';
  generatedCode: string | null = null;
  isOwner = false;
  quizStarted = false;
  currentQuestion = '';
  currentOptions: string[] = [];
  currentQuestionIndex = 0;
  timeLeftSeconds = 0;
  timerId: any = null;

  challengeName = '';
  domain: 'Verbal' | 'Logical' | 'Quant' | 'Mixed' = 'Mixed';
  squadSize = 10;
  numQuestions = 10;
  timeLimit = 20;

  settings: any = {
    challengeName: '',
    domain: 'Mixed',
    maxPlayers: 10,
    numQuestions: 10,
    timeLimit: 20
  };

  players: any[] = [];
  chat: string[] = [];
  newMessage = '';
  currentAnswers: any = {};
  hasAnswered = false;
  waitingForOthers = false;
  showFinalResults = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const u = this.auth.currentUser;
    this.username = u?.displayName || u?.email || 'Player';

    // Fetch user settings
    this.http.get<any>(`${API_URL}/settings/${encodeURIComponent(this.username)}`).subscribe({
      next: (s) => {
        if (s) {
          this.domain = s.defaultDomain || this.domain;
          this.numQuestions = Number(s.defaultQuestions || this.numQuestions);
          this.timeLimit = Number(s.defaultTimeLimit || this.timeLimit);
          this.squadSize = Number(s.maxPlayers || this.squadSize);
        }
      },
      error: () => {}
    });

    // Initialize Socket.IO with more robust configuration
    this.socket = io(SOCKET_URL, { 
      transports: ['polling', 'websocket'],
      timeout: 20000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect_error', (err: any) => {
      console.error('Socket connect_error:', err?.message || err);
      console.log('Trying to reconnect...');
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to server:', this.socket.id);
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('❌ Disconnected from server:', reason);
    });

    this.registerSocketEvents();
  }

  private registerSocketEvents() {
    this.socket.on('roomUpdate', (room: any) => {
      this.players = room.players || [];
      this.settings = room.settings || this.settings;
      this.generatedCode = room.roomCode || this.generatedCode;
      this.sortPlayersByScore();
    });

    this.socket.on('quizStarted', (data: any) => {
      this.quizStarted = true;
      this.currentQuestionIndex = data.currentQuestionIndex || 0;
      this.currentQuestion = data.currentQuestion;
      this.currentOptions = data.currentOptions || [];
      this.hasAnswered = false;
      this.waitingForOthers = false;
      this.timeLeftSeconds = data.timeLimit || 20;
      this.startTimer();
    });

    this.socket.on('timer', (timeLeft: number) => this.timeLeftSeconds = timeLeft);

    this.socket.on('answerSubmitted', (data: any) => {
      this.currentAnswers = data.currentAnswers;
      if (data.player === this.username) {
        this.hasAnswered = true;
        this.waitingForOthers = true;
      }
      this.players = data.players || this.players;
      this.sortPlayersByScore();
    });

    this.socket.on('questionFinished', (data: any) => {
      this.players = data.players;
      this.hasAnswered = false;
      this.waitingForOthers = false;
      this.sortPlayersByScore();
    });

    this.socket.on('quizFinished', (data: any) => {
      this.quizStarted = false;
      this.players = data.finalScores || [];
      this.sortPlayersByScore();
      this.showFinalResults = true;
      this.clearTimer();
    });

    this.socket.on('roomClosed', () => {
      alert('Host closed the room');
      this.generatedCode = null;
      this.players = [];
      this.quizStarted = false;
    });

    this.socket.on('chatMessage', (msg: string) => this.chat.push(msg));

    this.socket.on('error', (data: any) => {
      console.error('Server error:', data.message);
      alert(`Server error: ${data.message}`);
    });
  }

  createRoom() {
    const roomSettings = {
      challengeName: this.challengeName,
      domain: this.domain,
      maxPlayers: Number(this.squadSize || 10),
      numQuestions: Number(this.numQuestions || 10),
      timeLimit: Number(this.timeLimit || 20)
    };

    this.socket.emit('createRoom', { username: this.username, settings: roomSettings }, (res: any) => {
      if (res?.success) {
        this.generatedCode = res.roomCode;
        this.isOwner = true;
        this.settings = res.settings;
      } else alert('Create room failed');
    });
  }

  joinRoom() {
    if (!this.roomCode.trim()) return alert('Enter code');

    this.socket.emit('joinRoom', { username: this.username, roomCode: this.roomCode }, (res: any) => {
      if (res?.success) {
        this.generatedCode = res.roomCode;
        this.isOwner = res.roomOwner === this.username || this.isOwner;
      } else alert(res?.message || 'Join failed');
    });
  }

  startQuiz() {
    if (!this.isOwner || !this.generatedCode) return;
    this.socket.emit('startQuiz', { roomCode: this.generatedCode, username: this.username });
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.generatedCode) return;
    this.socket.emit('chatMessage', { roomCode: this.generatedCode, username: this.username, message: this.newMessage });
    this.newMessage = '';
  }

  chooseOption(option: string) {
    if (this.hasAnswered || !this.generatedCode) return;
    const index = this.currentOptions.indexOf(option);
    if (index === -1) return;
    this.socket.emit('submitAnswer', { roomCode: this.generatedCode, username: this.username, answer: index });
  }

  copyCode() {
    if (!this.generatedCode) return;
    navigator.clipboard.writeText(this.generatedCode).then(() => console.log('Room code copied'));
  }

  startTimer() {
    this.clearTimer();
    this.timerId = setInterval(() => {
      if (this.timeLeftSeconds <= 0 && !this.hasAnswered) {
        this.socket.emit('submitAnswer', { roomCode: this.generatedCode, username: this.username, answer: -1 });
        this.hasAnswered = true;
      }
    }, 1000);
  }

  clearTimer() {
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = null;
  }

  submitScore(score: number) {
    this.http.post(`${API_URL}/score`, { username: this.username, score }).subscribe({
      next: (res) => console.log('score saved', res),
      error: (err) => console.error(err)
    });
  }

  sortPlayersByScore() {
    this.players.sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  getRankIcon(index: number): string {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `${index + 1}.`;
    }
  }

  getRankText(index: number): string {
    switch (index) {
      case 0: return '1st Place';
      case 1: return '2nd Place';
      case 2: return '3rd Place';
      default: return `${index + 1}th Place`;
    }
  }

  onLogout() {
    window.location.href = '/dashboard';
  }

  ngOnDestroy() {
    this.socket.disconnect();
    this.clearTimer();
  }
}
