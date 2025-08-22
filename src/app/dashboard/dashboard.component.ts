// src/app/pages/dashboard/dashboard.component.ts
import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule],
  template: `
  <div class="dash">
    <header>
      <div class="brand">APTITUDE <span>ARENA</span></div>
      <div class="spacer"></div>
      <div class="user">👤 {{ displayName() }}</div>
      <button class="logout" (click)="onLogout()">Logout</button>
    </header>

    <main>
      <div class="grid">
        <button class="tile" (click)="open('quiz')">
          <div class="t">Start Quiz</div>
          <p>Sharpen logic, speed, accuracy.</p>
        </button>
        <button class="tile" (click)="open('leaderboard')">
          <div class="t">Leaderboard</div>
          <p>Compete with the best.</p>
        </button>
        <button class="tile" (click)="open('profile')">
          <div class="t">Profile</div>
          <p>Track your progress.</p>
        </button>
        <button class="tile" (click)="open('settings')">
          <div class="t">Settings</div>
          <p>Tune your arena.</p>
        </button>
      </div>
    </main>
  </div>
  `,
  styles: [`
  .dash{ min-height:100vh; background: radial-gradient(ellipse at top,#0b1020, #05060a 60%, #02030a 100%); color:#e7fbff }
  header{ display:flex; align-items:center; gap:14px; padding:16px 20px; border-bottom:1px solid rgba(0,255,255,.12) }
  .brand{ font-family:'Orbitron', system-ui, sans-serif; font-weight:900; letter-spacing:1px }
  .brand span{ color:#00ffb3 }
  .spacer{ flex:1 }
  .user{ opacity:.9 }
  .logout{ margin-left:10px; padding:8px 12px; background:#111827; border:1px solid rgba(255,255,255,.14); color:#e7fbff; border-radius:10px; cursor:pointer }
  .logout:hover{ border-color:#fca5a5; box-shadow:0 0 10px rgba(252,165,165,.2) }

  main{ padding:26px 20px }
  .grid{ display:grid; grid-template-columns: repeat( auto-fit, minmax(220px,1fr) ); gap:16px }
  .tile{
    text-align:left; padding:18px; border-radius:16px; cursor:pointer;
    background: linear-gradient(180deg, rgba(0,255,200,.12), rgba(0,0,0,.2));
    border:1px solid rgba(0,255,200,.25);
    box-shadow: 0 0 22px rgba(0,255,200,.08);
    transition: transform .1s ease, box-shadow .2s ease, border-color .2s ease;
  }
  .tile:hover{ transform: translateY(-2px); box-shadow: 0 0 28px rgba(0,255,200,.18); border-color:#00ffb3 }
  .tile .t{ font-weight:900; font-size:20px; margin-bottom:6px }
  .tile p{ opacity:.85; font-size:14px }
  `]
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
    // wire up navigation when those pages exist
    alert(`Open ${section} (stub)`);
  }
}
