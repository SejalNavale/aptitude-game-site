import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ScoreService {
  constructor(private http: HttpClient) {}

  saveScore(username: string, score: number) {
    return this.http.post('https://aptitude-game-site-backend.onrender.com/api/score', { username, score }).toPromise();
  }
}
