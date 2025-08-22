import { Routes } from '@angular/router';
import { SplashComponent } from './splash/splash.component';
import { AuthComponent } from './auth/auth.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', component: SplashComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
