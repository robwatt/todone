import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { Task } from '../models/task';
import { TaskService } from '../services/task.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  taskName!: string;
  tasks: Task[] = [];
  selectedTask: Task[] = [];

  private taskSub!: Subscription;

  constructor(private taskService: TaskService, private snackBar: MatSnackBar) {}

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
    this.taskService.addTask(this.taskName);
    this.snackBar.open('Task added');
    taskForm.reset();
  }

  /**
   * Opens the task to see more information, such as sub items
   */
  openTask(task: Task): void {
    this.selectedTask = [task];
  }

  /**
   * Marks the task as complete and either removes it from the list, or something else
   * @param event Event from the click
   */
  complete(event: any): void {
    event.stopPropagation();
    this.taskService.markTaskComplete(this.selectedTask[0].id);
  }

  delete(event: any, taskId: string): void {
    event.stopPropagation();
    if (taskId === this.selectedTask[0].id) {
      this.selectedTask = [];
    }
    this.taskService.removeTask(taskId);
  }
}
