import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Task } from 'src/app/models/task';
import { TaskService } from 'src/app/services/task.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class DetailsComponent implements OnInit {
  // this is the parent task - used to show the task name
  // may replace this at a later date when I have a better UX
  @Input() task: Task;

  subtasks: Task[];
  subTaskName: string;

  constructor(
    private taskService: TaskService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.taskService.subtaskSubject.subscribe((subtasks: Task[]) => {
      this.subtasks = subtasks;
    });
  }

  addSubTask(form: NgForm): void {
    this.taskService.addSubTask(this.subTaskName);
    this.snackBar.open('Sub-task added', 'Dismiss', {
      duration: 3000,
    });
    form.reset();
  }

  /**
   * Marks the task as completed.
   * @param subtaskId Subtask ID to mark as completed
   */
  complete(subtaskId: string): void {
    this.taskService.subtaskComplete(subtaskId, true);
  }

  /**
   * Marks the task as not completed.
   * @param subtaskId Subtask ID to mark as not completed
   */
  uncomplete(subtaskId: string): void {
    this.taskService.subtaskComplete(subtaskId, false);
  }

  delete(subtaskId: string): void {
    this.taskService.removeSubTask(subtaskId);
  }
}
