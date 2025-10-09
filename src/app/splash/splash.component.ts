// src/app/pages/splash/splash.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-splash',
  template: `
  <div class="splash">
    <div class="logo">APTITUDE <span>ARENA</span></div>
    <div class="glitch">Initializing Arena...</div>
    <div class="grid"></div>
  </div>
  `,
  styles: [`
  @keyframes glow { 0%,100%{text-shadow:0 0 8px #0ff} 50%{text-shadow:0 0 20px #0ff} }
  @keyframes pan { 0%{background-position:0 0} 100%{background-position:400px 400px} }
  .splash{
    height:100vh; display:grid; place-items:center; position:relative;
    background: radial-gradient(ellipse at top, #0b1020 0%, #05060a 60%, #02030a 100%);
    color:#e0faff; overflow:hidden;
  }
  .logo{
    font-family: 'Orbitron', system-ui, sans-serif;
    font-size: clamp(28px, 6vw, 72px); font-weight:800; letter-spacing:2px;
    animation: glow 2s ease-in-out infinite;
  }
  .logo span{ color:#00ffb3 }
  .glitch{ margin-top:12px; opacity:.85; letter-spacing:1px }
  .grid{
    position:absolute; inset:0;
    background-image: linear-gradient(rgba(0,255,255,.08) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(0,255,255,.08) 1px, transparent 1px);
    background-size: 40px 40px;
    animation: pan 18s linear infinite;
    pointer-events:none;
  }
  `]
})
export class SplashComponent implements OnInit {
  constructor(private router: Router) {}
  ngOnInit(): void {
    setTimeout(() => this.router.navigateByUrl('/auth'), 2500);
  }
}
