import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ScoreService {
  constructor(private http: HttpClient) {}

  saveScore(username: string, score: number) {
    return this.http.post('/api/score', { username, score }).toPromise();
  }
}
