import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DateTime } from 'luxon';
import { Task } from 'src/app/models/task';
import { TaskService } from 'src/app/services/task.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class DetailsComponent implements OnInit {
  // this is the parent task
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
    this.taskService.addSubTask(this.task.id, this.subTaskName);
    this.snackBar.open('Sub-task added');
    form.reset();
  }

  /**
   * Marks the task as completed.
   * @param event Event from the click
   * @param subtaskId Subtask ID to mark as completed
   */
  complete(event: any, subtaskId: string): void {
    event.stopPropagation();
    this.taskService.subtaskComplete(this.task.id, subtaskId, true);
  }

  /**
   * Marks the task as not completed.
   * @param event Event from the click
   * @param subtaskId Subtask ID to mark as not completed
   */
  uncomplete(event: any, subtaskId: string): void {
    event.stopPropagation();
    this.taskService.subtaskComplete(this.task.id, subtaskId, false);
  }

  delete(event: any, taskId: string): void {
    event.stopPropagation();
    this.taskService.removeSubTask(this.task.id, taskId);
  }

  /**
   * Converts the firebase Timestamp into a Luxon DateTime
   */
  toDatetime(task: Task): DateTime {
    return DateTime.fromJSDate(task.date.toDate());
  }
}
