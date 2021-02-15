import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DateTime } from 'luxon';
import { Task } from '../models/task';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss']
})
export class TaskComponent implements OnInit {

  @Input() task: Task;
  @Output() openTask: EventEmitter<any> = new EventEmitter();
  @Output() deleteTask: EventEmitter<any> = new EventEmitter();
  @Output() completeTask: EventEmitter<any> = new EventEmitter();
  @Output() uncompleteTask: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {}

  open(): void {
    this.openTask.emit(this.task);
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
