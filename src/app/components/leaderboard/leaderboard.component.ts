import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';

interface UserScore {
  _id: string;
  username: string;
  totalScore: number;
  gamesPlayed: number;
  averageScore: number;
  rank: number;
}

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent implements OnInit {
  private auth = inject(AuthService);
  private http = inject(HttpClient);
  private router = inject(Router);

  leaderboard: UserScore[] = [];
  currentUser: any = null;
  currentUserRank: number = 0;
  loading = true;
  error = '';

  ngOnInit() {
    this.currentUser = this.auth.currentUser;
    this.loadLeaderboard();
  }

  loadLeaderboard() {
    this.loading = true;
    this.http.get<UserScore[]>('http://localhost:5000/api/leaderboard')
      .subscribe({
        next: (data) => {
          this.leaderboard = data;
          this.findCurrentUserRank();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading leaderboard:', err);
          this.error = 'Failed to load leaderboard';
          this.loading = false;
        }
      });
  }

  findCurrentUserRank() {
    const currentUsername = this.currentUser?.displayName || this.currentUser?.email || 'Player';
    const userIndex = this.leaderboard.findIndex(user => user.username === currentUsername);
    this.currentUserRank = userIndex >= 0 ? userIndex + 1 : 0;
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
      case 0: return 'CHAMPION';
      case 1: return '2nd Place';
      case 2: return '3rd Place';
      default: return `${index + 1}th Place`;
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  refresh() {
    this.loadLeaderboard();
  }
}
