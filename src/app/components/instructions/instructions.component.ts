import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  CATEGORY_TIMER_RULES,
  MIN_ROOM_PLAYERS,
  MAX_ROOM_PLAYERS,
} from '../../core/game-config';

@Component({
  selector: 'app-instructions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './instructions.component.html',
  styleUrls: ['./instructions.component.css'],
})
export class InstructionsComponent {
  protected readonly timerRules = CATEGORY_TIMER_RULES;
  protected readonly minPlayers = MIN_ROOM_PLAYERS;
  protected readonly maxPlayers = MAX_ROOM_PLAYERS;

  protected readonly createSteps = [
    'Set a memorable challenge name and pick a category.',
    'Review the auto-assigned timer (based on category) and adjust the number of questions.',
    'Pick the squad size (up to 15). The default lobby reserves spots for 10 players.',
    'Hit “Create Battleground” to generate a shareable invite code.',
  ];

  protected readonly joinSteps = [
    'Grab the 4-digit invite code from your friend or host.',
    'Enter it in the Join Room card.',
    'You’ll land directly in the lobby with synced timers and chat.',
  ];

  protected readonly matchmakingNotes = [
    'Rooms are private by design—only players with the code can join.',
    'Hosts stay in control of quiz settings until the game starts.',
    'Timer pulses are broadcast from the server, so every player sees the exact same countdown.',
  ];

  protected readonly answeringRules = [
    'You can lock in only one answer per question.',
    'If the timer hits zero before you respond, we auto-submit “No Answer” so the match keeps moving.',
    'Once everyone answers (or the timer expires), we instantly grade and push the next question.',
  ];

  constructor(private readonly router: Router) {}

  continueToRoom(): void {
    this.router.navigate(['/quiz/room']);
  }
}

