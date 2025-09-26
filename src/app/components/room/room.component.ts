import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { io, Socket } from 'socket.io-client';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../core/auth.service';

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
  roomCode: string = '';
  generatedCode: string | null = null;
  isOwner = false;
  quizStarted = false;
  currentQuestion = '';
  currentOptions: string[] = [];
  currentQuestionIndex = 0;
  timeLeftSeconds = 0;
  timerId: any = null;
  // Game configuration
  challengeName: string = '';
  domain: 'Verbal' | 'Logical' | 'Quant' | 'Mixed' = 'Mixed';
  squadSize: number = 10;
  numQuestions: number = 10;
  timeLimit: number = 20;
  settings: any = {
    challengeName: '',
    domain: 'Mixed',
    maxPlayers: 10,
    numQuestions: 10,
    timeLimit: 20
  };
  players: any[] = [];
  chat: string[] = [];
  newMessage: string = '';
  questions: any[] = [];
  hasAnswered = false;
  waitingForOthers = false;
  currentAnswers: any = {};
  showFinalResults = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const u = this.auth.currentUser;
    this.username = (u?.displayName || u?.email || 'Player') as string;
    // Load saved defaults for quiz settings
    this.http.get<any>(`http://localhost:5000/api/settings/${encodeURIComponent(this.username)}`)
      .subscribe({
        next: (s) => {
          if (s) {
            this.domain = s.defaultDomain || this.domain;
            this.numQuestions = Number(s.defaultQuestions || this.numQuestions);
            this.timeLimit = Number(s.defaultTimeLimit || this.timeLimit);
            this.squadSize = Number((s.maxPlayers || this.squadSize));
          }
        },
        error: () => {}
      });
    this.socket = io('http://localhost:5000', { transports: ['websocket', 'polling'] });
    this.socket.on('connect_error', (err: any) => {
      console.error('Socket connect_error:', err?.message || err);
      alert('Cannot connect to game server. Please ensure it is running.');
    });
    this.socket.on('connect_timeout', () => {
      console.error('Socket connect_timeout');
    });

    this.socket.on('roomUpdate', (room: any) => {
      this.players = room.players || [];
      this.settings = room.settings || this.settings;
      if (room.maxPlayers) {
        this.settings.maxPlayers = room.maxPlayers;
      }
      this.generatedCode = room.roomCode || this.generatedCode;
      // Sort players by score for leaderboard
      this.sortPlayersByScore();
    });

    this.socket.on('quizStarted', (data: any) => {
      console.log('Quiz start signal received');
      this.quizStarted = true;
      this.currentQuestionIndex = data.currentQuestionIndex || 0;
      this.currentQuestion = data.currentQuestion;
      this.currentOptions = data.currentOptions || [];
      this.hasAnswered = false;
      this.waitingForOthers = false;
      this.timeLeftSeconds = data.timeLimit || 20;
      // Update settings with actual question count from server
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
      // Update players list with new scores
      this.players = data.players || this.players;
      this.sortPlayersByScore();
    });

    this.socket.on('questionFinished', (data: any) => {
      console.log('Question finished, correct answer:', data.correctAnswer);
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
  }

  createRoom() {
    // consolidate current form values into settings
    this.settings = {
      challengeName: this.challengeName,
      domain: this.domain,
      maxPlayers: Number(this.squadSize || 10),
      numQuestions: Number(this.numQuestions || 10),
      timeLimit: Number(this.timeLimit || 20)
    };
    this.socket.emit('createRoom', { username: this.username, settings: this.settings }, (res: any) => {
      if (res?.success) {
        this.generatedCode = res.roomCode;
        this.isOwner = true;
        this.settings = res.settings;
      } else {
        alert('Create room failed');
      }
    });
  }

  joinRoom() {
    if (!this.roomCode.trim()) return alert('Enter code');
    this.socket.emit('joinRoom', { username: this.username, roomCode: this.roomCode }, (res: any) => {
      if (res?.success) {
        this.generatedCode = res.roomCode;
        this.isOwner = (res.roomOwner === this.username) || this.isOwner;
      } else {
        alert(res?.message || 'Join failed');
      }
    });
  }

  updateSettings() {
    if (!this.generatedCode) return;
    this.socket.emit('updateSettings', { roomCode: this.generatedCode, settings: this.settings, username: this.username });
  }

  startQuiz() {
    if (!this.isOwner || !this.generatedCode) return;
    this.socket.emit('startQuiz', { roomCode: this.generatedCode, username: this.username });
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.generatedCode) return;
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
    // Timer is managed by server, just display the countdown
    this.timerId = setInterval(() => {
      if (this.timeLeftSeconds <= 0 && !this.hasAnswered) {
        // Time's up, submit empty answer
        this.socket.emit('submitAnswer', {
          roomCode: this.generatedCode,
          username: this.username,
          answer: -1
        });
        this.hasAnswered = true;
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
    this.http.post('http://localhost:8080/api/score', { username: this.username, score })
      .subscribe(res => console.log('score saved', res), err => console.error(err));
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
    this.socket.disconnect();
  }
}
