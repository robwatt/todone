import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Task } from 'src/app/models/task';
import { TaskService } from 'src/app/services/task.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {

  @Input() task!: Task;

  subTaskName!: string;

  constructor(private taskService: TaskService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.taskService.subtaskSubject.subscribe((task: Task) => {
      this.task = task;
    })
  }

  addSubTask(form: NgForm): void {
    this.taskService.addSubTask(this.task.id, this.subTaskName);
    this.snackBar.open('Sub-task added');
    form.reset();
  }

  /**
   * Marks the task as complete and either removes it from the list, or something else
   * @param event Event from the click
   */
  complete(event: any): void {
    event.stopPropagation();
  }

  delete(event: any, taskId: string): void {
    event.stopPropagation();
    this.taskService.removeSubTask(this.task.id, taskId);
  }
}
