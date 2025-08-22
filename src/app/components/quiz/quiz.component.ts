import { Component } from '@angular/core';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent {
  question = "What is 5 + 7?";
  options = ["10", "11", "12", "13"];
  correctAnswer = "12";
  selectedAnswer = '';
  result = '';

  checkAnswer(option: string) {
    this.selectedAnswer = option;
    this.result = option === this.correctAnswer ? '✅ Correct!' : '❌ Wrong!';
  }
}
