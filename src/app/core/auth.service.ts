import { Injectable, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, User } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor() {
    onAuthStateChanged(this.auth, (u) => this.userSubject.next(u));
  }

  get currentUser(): User | null {
    return this.auth.currentUser;
  }

  async register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  async login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async googleSignIn() {
    const provider = new GoogleAuthProvider();
    // This opens the Google account chooser (unless already signed in in the browser)
    return signInWithPopup(this.auth, provider);
  }

  async logout() {
    return signOut(this.auth);
  }
}
