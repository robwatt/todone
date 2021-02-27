import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { isNil } from 'lodash';
import { Subscription } from 'rxjs';
import { Task } from '../models/task';
import { TaskService } from '../services/task.service';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.scss'],
})
export class TodoComponent implements OnInit, OnDestroy {
  tasks: Task[] = [];
  selectedTask: Task[] = [];

  private taskSub: Subscription;

  constructor(
    private taskService: TaskService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.taskSub = this.taskService.taskSubject.subscribe((tasks: Task[]) => {
      this.tasks = tasks;
    });
  }

  ngOnDestroy(): void {
    if (this.taskSub) {
      this.taskSub.unsubscribe();
    }
  }

  addTask(taskForm: NgForm): void {
    const taskName = taskForm.value.task;
    if (isNil(taskName)) {
      taskForm.form.controls.task.setErrors({ invalid: true });
      // stop processing the form.
      return;
    }
    this.taskService.addTask(taskForm.value.task);
    this.snackBar.open('Task added', 'Dismiss', {
      duration: 3000
    });
    taskForm.reset();
  }

  /**
   * Opens the task to see more information, such as sub items
   */
  openTask(task: Task): void {
    this.selectedTask = [task];
    this.taskService.openTask(task.id);
  }

  /**
   * Marks the task as complete.
   * @param taskId Task ID to mark as completed
   */
  complete(taskId: string): void {
    this.taskService.taskComplete(taskId, true);
  }

  /**
   * Marks the task as not completed.
   * @param taskId Task ID to mark as not completed
   */
  uncomplete(taskId: string): void {
    this.taskService.taskComplete(taskId, false);
  }

  /**
   * Deletes a task from the list
   * @param taskId Task ID to delete
   */
  delete(taskId: string): void {
    // if the task to be deleted is also selected, reset the selection, this will hide the subtask panel.
    if (this.selectedTask[0] && taskId === this.selectedTask[0].id) {
      this.selectedTask = [];
    }
    this.taskService.removeTask(taskId);
  }
}
