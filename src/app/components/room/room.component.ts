import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { io, Socket } from 'socket.io-client';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../core/auth.service';
import {
  CATEGORY_TIMER_RULES,
  MIN_ROOM_PLAYERS,
  MAX_ROOM_PLAYERS,
  getTimerLabelForDomain,
  getTimerSecondsForDomain,
} from '../../core/game-config';

type DomainOption = 'Verbal' | 'Logical' | 'Quant' | 'Mixed';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit, OnDestroy {
  socket!: Socket | null;

  private auth = inject(AuthService);

  readonly timerRules = CATEGORY_TIMER_RULES;
  readonly minPlayersRequired = MIN_ROOM_PLAYERS;
  readonly maxPlayersAllowed = MAX_ROOM_PLAYERS;

  username = '';
  roomCode = '';
  generatedCode: string | null = null;
  isOwner = false;
  quizStarted = false;
  challengeName = '';
  domain: DomainOption = 'Mixed';
  squadSize = 10;
  numQuestions = 10;

  currentQuestion = '';
  currentOptions: string[] = [];
  currentQuestionIndex = 0;
  currentQuestionTimerLabel = '';
  currentTimerLabel = getTimerLabelForDomain(this.domain);
  currentTimerSeconds = getTimerSecondsForDomain(this.domain);
  timeLeftSeconds = 0;
  timerId: any = null;

  settings: any = {
    challengeName: '',
    domain: this.domain,
    maxPlayers: this.squadSize,
    numQuestions: this.numQuestions,
    timeLimit: this.currentTimerSeconds,
  };
  players: any[] = [];
  topThreePlayers: any[] = [];
  remainingPlayers: any[] = [];
  chat: string[] = [];
  newMessage = '';
  questions: any[] = [];
  hasAnswered = false;
  waitingForOthers = false;
  currentAnswers: Record<string, number> = {};
  showFinalResults = false;

  // Replace localhost with your deployed backend
  private readonly SOCKET_URL = 'https://aptitude-game-site-backend-wdo1.onrender.com';
  private readonly API_BASE = 'https://aptitude-game-site-backend-wdo1.onrender.com';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const u = this.auth.currentUser;
    this.username = (u?.displayName || u?.email || 'Player') as string;
    this.syncTimerMeta(this.domain);

    // Load saved defaults for quiz settings
    this.http.get<any>(`${this.API_BASE}/api/settings/${encodeURIComponent(this.username)}`)
      .subscribe({
        next: (s) => {
          if (s) {
            this.domain = (s.defaultDomain as DomainOption) || this.domain;
            this.numQuestions = Number(s.defaultQuestions || this.numQuestions);
            this.squadSize = this.clampSquadSize(Number(s.maxPlayers || this.squadSize));
            this.syncTimerMeta(this.domain);
            this.settings.maxPlayers = this.squadSize;
            this.settings.numQuestions = this.numQuestions;
          }
        },
        error: (err) => {
          // ignore or optionally console
          console.warn('Failed to load settings', err);
        }
      });

    // Connect socket to deployed backend
    this.socket = io(this.SOCKET_URL, { transports: ['websocket', 'polling'] });

    this.socket.on('connect', () => {
      console.log('Connected to socket server:', this.socket?.id);
    });

    this.socket.on('connect_error', (err: any) => {
      console.error('Socket connect_error:', err?.message || err);
      alert('Cannot connect to game server. Please ensure it is running.');
    });
    this.socket.on('connect_timeout', () => {
      console.error('Socket connect_timeout');
    });

    this.socket.on('roomUpdate', (room: any) => {
      this.players = room.players || [];
      this.mergeSettingsFromServer(room.settings);
      if (room.maxPlayers) {
        this.settings.maxPlayers = this.clampSquadSize(room.maxPlayers);
      }
      this.generatedCode = room.roomCode || this.generatedCode;
      this.sortPlayersByScore();
    });

    this.socket.on('quizStarted', (data: any) => {
      console.log('Quiz start signal received');
      this.quizStarted = true;
      this.currentQuestionIndex = data.currentQuestionIndex || 0;
      this.currentQuestion = data.currentQuestion;
      this.currentOptions = data.currentOptions || [];
      this.currentAnswers = {};
      this.hasAnswered = false;
      this.waitingForOthers = false;
      this.currentQuestionTimerLabel = data.timerLabel || this.currentTimerLabel;
      this.timeLeftSeconds = data.timeLimit || this.currentTimerSeconds;
      if (data.numQuestions) {
        this.settings.numQuestions = data.numQuestions;
      }
      this.startTimer();
    });

    this.socket.on('timer', (timeLeft: number) => {
      this.timeLeftSeconds = timeLeft;
    });

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
      console.log('Question finished, correct answer:', data.correctAnswer);
      this.players = data.players;
      this.hasAnswered = false;
      this.waitingForOthers = false;
      this.currentQuestionTimerLabel = '';
      this.timeLeftSeconds = 0;
      this.currentAnswers = {};
      this.sortPlayersByScore();
    });

    this.socket.on('quizFinished', (data: any) => {
      this.quizStarted = false;
      this.players = data.finalScores || [];
      this.sortPlayersByScore();
      this.showFinalResults = true;
      this.currentQuestionTimerLabel = '';
      this.currentAnswers = {};
      this.clearTimer();
      console.log('Final scores:', data.finalScores);
    });

    this.socket.on('roomClosed', () => {
      alert('Host closed the room');
      this.generatedCode = null;
      this.players = [];
      this.quizStarted = false;
    });

    this.socket.on('chatMessage', (msg: string) => {
      this.chat.push(msg);
    });

    this.socket.on('roomError', (message: string) => {
      alert(message);
    });
  }

  createRoom() {
    const cappedPlayers = this.clampSquadSize(this.squadSize);
    const timerForDomain = getTimerSecondsForDomain(this.domain);
    this.settings = {
      challengeName: this.challengeName,
      domain: this.domain,
      maxPlayers: cappedPlayers,
      numQuestions: Number(this.numQuestions || 10),
      timeLimit: timerForDomain,
    };
    if (!this.socket) return alert('Socket not connected');
    this.socket.emit('createRoom', { username: this.username, settings: this.settings }, (res: any) => {
      if (res?.success) {
        this.generatedCode = res.roomCode;
        this.isOwner = true;
        this.mergeSettingsFromServer(res.settings);
      } else {
        alert(res?.message || 'Create room failed');
      }
    });
  }

  joinRoom() {
    if (!this.roomCode.trim()) return alert('Enter code');
    if (!this.socket) return alert('Socket not connected');
    this.socket.emit('joinRoom', { username: this.username, roomCode: this.roomCode }, (res: any) => {
      if (res?.success) {
        this.generatedCode = res.roomCode;
        this.isOwner = (res.roomOwner === this.username) || this.isOwner;
        this.mergeSettingsFromServer(res.settings);
      } else {
        alert(res?.message || 'Join failed');
      }
    });
  }

  updateSettings() {
    if (!this.generatedCode) return;
    if (!this.socket) return alert('Socket not connected');
    this.socket.emit('updateSettings', { roomCode: this.generatedCode, settings: this.settings, username: this.username });
  }

  startQuiz() {
    if (!this.isOwner || !this.generatedCode) return;
    if (!this.socket) return alert('Socket not connected');
    const canStart = this.players.length >= this.minPlayersRequired;
    let forceEarlyStart = false;
    if (!canStart) {
      const confirmStart = confirm(`Only ${this.players.length} player(s) in the room. Start anyway?`);
      if (!confirmStart) {
        return;
      }
      forceEarlyStart = true;
    }
    this.socket.emit('startQuiz', { roomCode: this.generatedCode, username: this.username, forceEarlyStart });
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.generatedCode) return;
    if (!this.socket) return alert('Socket not connected');
    this.socket.emit('chatMessage', {
      roomCode: this.generatedCode,
      username: this.username,
      message: this.newMessage
    });
    this.newMessage = '';
  }

  copyCode() {
    if (!this.generatedCode) return;
    const code = this.generatedCode;
    const nav: any = (window as any).navigator;
    if (nav && nav.clipboard && nav.clipboard.writeText) {
      nav.clipboard.writeText(code).then(() => {
        console.log('Room code copied');
      });
    } else {
      const input = document.createElement('input');
      input.value = code;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      console.log('Room code copied (fallback)');
    }
  }

  chooseOption(option: string) {
    if (this.hasAnswered || !this.generatedCode) return;
    const index = this.currentOptions.indexOf(option);
    if (index === -1) return;
    console.log('Selected option index:', index);
    if (!this.socket) return alert('Socket not connected');
    this.socket.emit('submitAnswer', {
      roomCode: this.generatedCode,
      username: this.username,
      answer: index   // send index, not string
    });
  }

  nextQuestion() {
    if (!this.questions.length) return;
    const next = this.currentQuestionIndex + 1;
    if (next < this.questions.length) {
      this.currentQuestionIndex = next;
      const q = this.questions[next];
      this.currentQuestion = q.question;
      this.currentOptions = q.options || [];
      this.startTimer();
    } else {
      this.currentQuestion = 'Quiz finished!';
      this.currentOptions = [];
      this.clearTimer();
    }
  }

  startTimer() {
    this.clearTimer();
    // Timer is managed by server, just display the countdown and ensure timeout submits
    this.timerId = setInterval(() => {
      if (this.timeLeftSeconds <= 0 && !this.hasAnswered && this.generatedCode) {
        if (this.socket) {
          this.socket.emit('submitAnswer', {
            roomCode: this.generatedCode,
            username: this.username,
            answer: -1
          });
        }
        this.hasAnswered = true;
        this.waitingForOthers = true;
      }
    }, 1000);
  }

  clearTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  submitScore(score: number) {
    // score API now points to deployed API base (portless)
    this.http.post(`${this.API_BASE}/api/score`, { username: this.username, score })
      .subscribe(res => console.log('score saved', res), err => console.error(err));
  }

  sortPlayersByScore() {
    this.players.sort((a, b) => (b.score || 0) - (a.score || 0));
    this.topThreePlayers = this.players.slice(0, 3);
    this.remainingPlayers = this.players.slice(3);
  }

  selectDomain(domain: DomainOption) {
    this.domain = domain;
    this.settings.domain = domain;
    this.syncTimerMeta(domain);
  }

  private clampSquadSize(size: number): number {
    const numeric = Number(size);
    if (!Number.isFinite(numeric)) {
      return this.maxPlayersAllowed;
    }
    return Math.min(this.maxPlayersAllowed, Math.max(this.minPlayersRequired, Math.round(numeric)));
  }

  private syncTimerMeta(domain: DomainOption) {
    this.currentTimerLabel = getTimerLabelForDomain(domain);
    this.currentTimerSeconds = getTimerSecondsForDomain(domain);
  }

  private mergeSettingsFromServer(payload?: any) {
    if (!payload) {
      return;
    }
    this.settings = {
      ...this.settings,
      ...payload,
    };
    this.settings.maxPlayers = this.clampSquadSize(this.settings.maxPlayers || this.maxPlayersAllowed);
    this.domain = (this.settings.domain as DomainOption) || this.domain;
    this.squadSize = this.settings.maxPlayers;
    this.numQuestions = this.settings.numQuestions || this.numQuestions;
    this.syncTimerMeta(this.domain);
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
      case 0: return 'WINNER';
      case 1: return '2nd Place';
      case 2: return '3rd Place';
      default: return `${index + 1}th Place`;
    }
  }

  onLogout() {
    window.location.href = '/dashboard';
  }

  ngOnDestroy() {
    if (this.socket) {
      try {
        this.socket.disconnect();
      } catch (err) {
        console.warn('Error disconnecting socket', err);
      }
      this.socket = null;
    }
    this.clearTimer();
  }
}
