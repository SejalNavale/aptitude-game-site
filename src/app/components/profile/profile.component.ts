import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';

interface UserProfile {
  username: string;
  email: string;
  totalScore: number;
  gamesPlayed: number;
  averageScore: number;
  rank: number;
  joinDate: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  private auth = inject(AuthService);
  private http = inject(HttpClient);
  private router = inject(Router);

  currentUser: any = null;
  profile: UserProfile | null = null;
  loading = true;
  error = '';
  
  // Form data
  newUsername = '';
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  
  // UI states
  editingUsername = false;
  changingPassword = false;
  saving = false;
  message = '';

  ngOnInit() {
    this.currentUser = this.auth.currentUser;
    this.newUsername = this.currentUser?.displayName || this.currentUser?.email || '';
    this.loadProfile();
  }

  loadProfile() {
    this.loading = true;
    const username = this.currentUser?.displayName || this.currentUser?.email || 'Player';
    
    // ✅ Use proxy path instead of hardcoded backend URL
    this.http.get<UserProfile>(`/api/profile/${encodeURIComponent(username)}`)
      .subscribe({
        next: (data) => {
          this.profile = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading profile:', err);
          this.error = 'Failed to load profile';
          this.loading = false;
        }
      });
  }

  startEditingUsername() {
    this.editingUsername = true;
    this.newUsername = this.profile?.username || this.currentUser?.displayName || this.currentUser?.email || '';
  }

  cancelEditingUsername() {
    this.editingUsername = false;
    this.newUsername = this.profile?.username || this.currentUser?.displayName || this.currentUser?.email || '';
    this.message = '';
  }

  saveUsername() {
    if (!this.newUsername.trim()) {
      this.message = 'Username cannot be empty';
      return;
    }

    this.saving = true;
    const currentUsername = this.currentUser?.displayName || this.currentUser?.email || 'Player';
    
    // Update display name in Firebase first, then reflect in backend scores
    this.auth.updateDisplayName(this.newUsername.trim())
      .then(() => this.http.put('/api/profile/username', {
        currentUsername,
        newUsername: this.newUsername.trim()
      }).toPromise())
      .then(() => {
        this.currentUser = this.auth.currentUser;
        this.message = 'Username updated successfully!';
        this.editingUsername = false;
        this.saving = false;
        this.loadProfile();
        setTimeout(() => this.message = '', 3000);
      })
      .catch((err) => {
        console.error('Error updating username:', err);
        this.message = err?.message || 'Failed to update username';
        this.saving = false;
      });
  }

  startChangingPassword() {
    this.changingPassword = true;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.message = '';
  }

  cancelChangingPassword() {
    this.changingPassword = false;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.message = '';
  }

  savePassword() {
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.message = 'All password fields are required';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.message = 'New passwords do not match';
      return;
    }

    if (this.newPassword.length < 6) {
      this.message = 'Password must be at least 6 characters long';
      return;
    }

    this.saving = true;
    this.auth.changePassword(this.currentPassword, this.newPassword)
      .then(() => {
        this.message = 'Password updated successfully!';
        this.changingPassword = false;
        this.saving = false;
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        setTimeout(() => this.message = '', 3000);
      })
      .catch((err) => {
        console.error('Error updating password:', err);
        this.message = err?.message || 'Failed to update password';
        this.saving = false;
      });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  getRankIcon(rank: number): string {
    if (rank <= 3) {
      switch (rank) {
        case 1: return '🥇';
        case 2: return '🥈';
        case 3: return '🥉';
      }
    }
    return `#${rank}`;
  }
}
