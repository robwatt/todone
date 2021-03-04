import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DateTime } from 'luxon';
import { Task } from '../models/task';
import { TaskService } from '../services/task.service';
import { EditContentComponent } from '../todo/edit-content/edit-content.component';

export interface EditDialogData {
  name: string;
}
@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss']
})
export class TaskComponent implements OnInit {
  @Input() task: Task;
  @Input() level = 0;
  @Output() openTask: EventEmitter<any> = new EventEmitter();
  @Output() deleteTask: EventEmitter<any> = new EventEmitter();
  @Output() completeTask: EventEmitter<any> = new EventEmitter();
  @Output() uncompleteTask: EventEmitter<any> = new EventEmitter();

  constructor(private dialog: MatDialog, private taskService: TaskService) {}

  ngOnInit(): void {}

  open(): void {
    this.openTask.emit(this.task);
  }

  /**
   * This allows a user to edit the name of the task.
   * @param event Click event
   */
  edit(event: any): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(EditContentComponent, {
      width: '500px',
      data: { name: this.task.name }
    });

    dialogRef.afterClosed().subscribe((result) => {
      // need to update the tasks name
      if (this.level === 0) {
        this.taskService.updateTask(this.task.id, { name: result });
      } else {
        this.taskService.updateSubtask(this.task.id, { name: result });
      }
    });
  }

  complete(event: any): void {
    event.stopPropagation();
    this.completeTask.emit(this.task.id);
  }

  uncomplete(event: any): void {
    event.stopPropagation();
    this.uncompleteTask.emit(this.task.id);
  }

  delete(event: any): void {
    event.stopPropagation();
    this.deleteTask.emit(this.task.id);
  }

  /**
   * Converts the firebase Timestamp into a Luxon DateTime
   */
  toDatetime(task: Task): DateTime {
    return DateTime.fromJSDate(task.date.toDate());
  }
}
