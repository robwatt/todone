import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.scss']
})
export class TodoComponent {
  constructor(private snackBar: MatSnackBar) {}

  /**
   * Called once a task has been added successfully
   */
  taskAdded(): void {
    this.snackBar.open('Task added', 'Dismiss', {
      duration: 3000
    });
  }
}
