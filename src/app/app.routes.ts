import { Routes } from '@angular/router';
import { SplashComponent } from './splash/splash.component';
import { AuthComponent } from './auth/auth.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RoomComponent } from './components/room/room.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { ProfileComponent } from './components/profile/profile.component';
import { SettingsComponent } from './components/settings/settings.component';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'splash', pathMatch: 'full' },
  { path: 'splash', component: SplashComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'quiz/room', component: RoomComponent, canActivate: [authGuard] },
  { path: 'room', component: RoomComponent, canActivate: [authGuard] },
  { path: 'leaderboard', component: LeaderboardComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'splash' },
];
