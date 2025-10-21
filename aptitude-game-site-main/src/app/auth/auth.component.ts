// src/app/pages/auth/auth.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  standalone: true,
  selector: 'app-auth',
  imports: [CommonModule, FormsModule],
  template: `
  <div class="auth-wrap">
    <div class="bg-anim"></div>

    <div class="card">
      <div class="title">Enter the <span>Arena</span></div>

      <div class="tabs">
        <button [class.active]="tab==='login'" (click)="tab='login'">Login</button>
        <button [class.active]="tab==='register'" (click)="tab='register'">Register</button>
      </div>

      <!-- LOGIN -->
      <form *ngIf="tab==='login'" (ngSubmit)="onLogin()" class="form">
        <label>Email</label>
        <input type="email" [(ngModel)]="email" name="lemail" required />
        <label>Password</label>
        <input type="password" [(ngModel)]="password" name="lpass" required />
        <button type="submit" class="primary">Login</button>
      </form>

      <!-- REGISTER -->
      <form *ngIf="tab==='register'" (ngSubmit)="onRegister()" class="form">
        <label>Email</label>
        <input type="email" [(ngModel)]="email" name="remail" required />
        <label>Password</label>
        <input type="password" [(ngModel)]="password" name="rpass" minlength="6" required />
        <label>Confirm Password</label>
        <input type="password" [(ngModel)]="confirm" name="rcpass" required />
        <button type="submit" class="primary">Create Account</button>
      </form>

      <div class="divider"><span>or</span></div>

      <button class="google" (click)="onGoogle()">
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" />
        Continue with Google
      </button>

      <p *ngIf="message" [class.error]="isError" [class.ok]="!isError" class="msg">{{ message }}</p>
    </div>
  </div>
  `,
  styles: [`
  /* Background */
  .auth-wrap{
    min-height:100vh; display:grid; place-items:center; position:relative; overflow:hidden;
    background: radial-gradient(ellipse at center, #0a0f1f 0%, #05060a 65%, #02030a 100%);
    color:#e7fbff;
  }
  .bg-anim{
    position:absolute; inset:-20%;
    background:
      radial-gradient(600px 200px at 20% 30%, rgba(0,255,255,.10), transparent 60%),
      radial-gradient(500px 240px at 80% 70%, rgba(255,0,255,.10), transparent 60%);
    filter: blur(20px);
    animation: float 12s ease-in-out infinite alternate;
  }
  @keyframes float { from { transform: translateY(-20px)} to { transform: translateY(20px)} }

  /* Card */
  .card{
    position:relative; width:min(92vw, 460px);
    padding:28px 26px;
    background: rgba(8,12,24,.72);
    border: 1px solid rgba(0,255,255,.18);
    border-radius:18px;
    box-shadow: 0 0 30px rgba(0,255,180,.12), inset 0 0 40px rgba(0,255,255,.04);
    backdrop-filter: blur(8px);
  }
  .title{
    text-align:center; font-family:'Orbitron', system-ui, sans-serif;
    font-weight:800; font-size:28px; margin-bottom:14px; letter-spacing:1px;
  }
  .title span{ color:#00ffb3; }

  /* Tabs */
  .tabs{ display:flex; gap:8px; background:rgba(255,255,255,.04); padding:6px; border-radius:12px; margin:10px 0 18px }
  .tabs button{
    flex:1; padding:10px 12px; border-radius:10px; border:1px solid transparent;
    background:transparent; color:#cfefff; cursor:pointer; font-weight:700;
  }
  .tabs button.active{
    background: linear-gradient(90deg, rgba(0,255,255,.16), rgba(0,255,179,.18));
    border-color: rgba(0,255,200,.35);
  }

  /* Form */
  .form{ display:grid; gap:10px; }
  label{ font-size:12px; opacity:.8 }
  input{
    background:#0b1226; border:1px solid rgba(0,255,255,.18);
    color:#e7fbff; padding:10px 12px; border-radius:10px; outline:none;
  }
  input:focus{ border-color:#00ffb3; box-shadow:0 0 0 3px rgba(0,255,179,.15) }

  .primary{
    margin-top:6px; padding:12px 14px; font-weight:800; cursor:pointer;
    border-radius:12px; border:1px solid rgba(0,255,200,.45);
    background: radial-gradient(100% 100% at 50% 0%, rgba(0,255,255,.25), rgba(0,255,179,.15));
    transition: transform .08s ease, box-shadow .12s ease;
  }
  .primary:hover{ box-shadow:0 0 18px rgba(0,255,200,.24) }
  .primary:active{ transform: translateY(1px) }

  .divider{ display:grid; place-items:center; margin:16px 0; opacity:.75; }
  .divider span{ background:rgba(0,0,0,.3); padding:0 8px }

  .google{
    width:100%; display:flex; align-items:center; justify-content:center; gap:10px;
    padding:12px; border-radius:12px; cursor:pointer;
    background:#0f172a; border:1px solid rgba(255,255,255,.14);
    transition: border-color .15s ease, box-shadow .15s ease;
  }
  .google:hover{ border-color:#7dd3fc; box-shadow:0 0 16px rgba(125,211,252,.18) }
  .google img{ width:18px; height:18px }

  .msg{ margin-top:12px; text-align:center; font-weight:600 }
  .error{ color:#fda4af }
  .ok{ color:#86efac }
  `]
})
export class AuthComponent {
  tab: 'login' | 'register' = 'login';
  email = '';
  password = '';
  confirm = '';
  message = '';
  isError = false;

  constructor(private auth: AuthService, private router: Router) {}

  async onLogin() {
    this.clearMsg();
    try {
      await this.auth.login(this.email.trim(), this.password);
      this.message = 'Welcome back! Redirecting…'; this.isError = false;
      setTimeout(() => this.router.navigateByUrl('/dashboard'), 500);
    } catch (e: any) {
      this.fail(e?.message || 'Login failed');
    }
  }

  async onRegister() {
    this.clearMsg();
    if (this.password !== this.confirm) {
      return this.fail('Passwords do not match');
    }
    try {
      await this.auth.register(this.email.trim(), this.password);
      this.message = 'Account created! You are logged in.'; this.isError = false;
      setTimeout(() => this.router.navigateByUrl('/dashboard'), 600);
    } catch (e: any) {
      this.fail(e?.message || 'Registration failed');
    }
  }

  async onGoogle() {
    this.clearMsg();
    try {
      await this.auth.googleSignIn();
      this.message = 'Signed in with Google!'; this.isError = false;
      setTimeout(() => this.router.navigateByUrl('/dashboard'), 400);
    } catch (e: any) {
      // Common causes: popup blocked, third-party cookies disabled, provider not enabled
      this.fail(e?.message || 'Google sign-in failed');
    }
  }

  private clearMsg(){ this.message=''; this.isError=false; }
  private fail(msg:string){ this.message=msg; this.isError=true; }
}
