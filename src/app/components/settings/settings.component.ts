import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';

interface AppSettings {
  notifications: boolean;
  soundEffects: boolean;
  theme: string;
  language: string;
  autoStart: boolean;
  defaultTimeLimit: number;
  defaultQuestions: number;
  defaultDomain: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  private auth = inject(AuthService);
  private http = inject(HttpClient);
  private router = inject(Router);

  currentUser: any = null;
  settings: AppSettings = {
    notifications: true,
    soundEffects: true,
    theme: 'dark',
    language: 'en',
    autoStart: false,
    defaultTimeLimit: 20,
    defaultQuestions: 10,
    defaultDomain: 'Mixed'
  };
  
  loading = true;
  saving = false;
  message = '';

  ngOnInit() {
    this.currentUser = this.auth.currentUser;
    this.loadSettings();
  }

  loadSettings() {
    this.loading = true;
    const username = this.currentUser?.displayName || this.currentUser?.email || 'Player';
    
    this.http.get<AppSettings>(`http://localhost:5000/api/settings/${encodeURIComponent(username)}`)
      .subscribe({
        next: (data) => {
          this.settings = { ...this.settings, ...data };
          this.loading = false;
          // apply theme immediately
          this.applyTheme();
        },
        error: (err) => {
          console.error('Error loading settings:', err);
          // Use default settings if loading fails
          this.loading = false;
        }
      });
  }

  saveSettings() {
    this.saving = true;
    const username = this.currentUser?.displayName || this.currentUser?.email || 'Player';
    
    this.http.put('http://localhost:5000/api/settings', {
      username,
      settings: this.settings
    }).subscribe({
      next: (response: any) => {
        this.message = 'Settings saved successfully!';
        this.saving = false;
        this.applyTheme();
        setTimeout(() => this.message = '', 3000);
      },
      error: (err) => {
        console.error('Error saving settings:', err);
        this.message = 'Failed to save settings';
        this.saving = false;
        setTimeout(() => this.message = '', 3000);
      }
    });
  }

  resetToDefaults() {
    this.settings = {
      notifications: true,
      soundEffects: true,
      theme: 'dark',
      language: 'en',
      autoStart: false,
      defaultTimeLimit: 20,
      defaultQuestions: 10,
      defaultDomain: 'Mixed'
    };
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  onThemeChange() {
    this.applyTheme();
  }

  private applyTheme() {
    const theme = this.settings.theme || 'dark';
    document.body.setAttribute('data-theme', theme);
  }
}

