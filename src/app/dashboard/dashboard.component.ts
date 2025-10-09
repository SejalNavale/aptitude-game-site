import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/auth.service';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  displayName = computed(() => {
    const u = this.auth.currentUser;
    return u?.displayName || u?.email || 'Player';
  });

  async onLogout() {
    await this.auth.logout();
    this.router.navigateByUrl('/auth');
  }

  open(section: string) {
    switch (section) {
      case 'quiz':
        this.router.navigate(['/quiz/room']);
        break;
      case 'leaderboard':
        this.router.navigate(['/leaderboard']);
        break;
      case 'profile':
        this.router.navigate(['/profile']);
        break;
      case 'settings':
        this.router.navigate(['/settings']);
        break;
      default:
        alert(`Open ${section} (not implemented)`);
    }
  }
}
