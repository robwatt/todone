import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';

interface TodoInterface {
  routeParam: string;
  title: string;
}

const todo: TodoInterface[] = [
  { routeParam: 'work', title: 'Work' },
  { routeParam: 'personal', title: 'Personal' }
];

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.scss']
})
export class TodoComponent {
  appliedFilterEvent: Event;
  title: string;
  length = 0;

  constructor(private activatedRoute: ActivatedRoute, private snackBar: MatSnackBar) {
    this.activatedRoute.data.subscribe((value) => {
      if (value.todoType) {
        const todoValue: TodoInterface = todo.find(v => v.routeParam === value.todoType);
        if (todoValue) {
          this.title = todoValue.title;
        }
      }
    });
  }

  /**
   * Called once a task has been added successfully
   */
  taskAdded(): void {
    this.snackBar.open('Task added', 'Dismiss', {
      duration: 3000
    });
  }

  appliedFiltersChanged(event: Event): void {
    this.appliedFilterEvent = event;
  }
}
