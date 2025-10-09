import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
  domain: string;
}

@Injectable({ providedIn: 'root' })
export class QuizService {
  private http = inject(HttpClient);
  private baseUrl = 'https://aptitude-game-site-backend.onrender.com/api';

  async getQuestions(domain: string, numQuestions: number): Promise<QuizQuestion[]> {
  return await firstValueFrom(
    this.http.get<QuizQuestion[]>(`${this.baseUrl}/questions?domain=${domain}&limit=${numQuestions}`)
  );
}


  async submitScore(username: string, score: number) {
    return firstValueFrom(this.http.post(`${this.baseUrl}/score`, { username, score }));
  }
}
