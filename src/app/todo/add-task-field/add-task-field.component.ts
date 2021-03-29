import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { isNil } from 'lodash';
import { TaskService } from 'src/app/services/task.service';
import { Task2Service } from 'src/app/services/task2.service';

@Component({
  selector: 'app-add-task-field',
  templateUrl: './add-task-field.component.html',
  styleUrls: ['./add-task-field.component.scss']
})
export class AddTaskFieldComponent implements OnInit {
  @Output() taskAdded = new EventEmitter();

  constructor(private taskService: Task2Service) {}

  ngOnInit(): void {}

  addTask(taskForm: NgForm): void {
    const taskName = taskForm.value.task;
    if (isNil(taskName)) {
      taskForm.form.controls.task.setErrors({ invalid: true });
      // stop processing the form.
      return;
    }
    this.taskService.addTask(taskForm.value.task);
    this.taskAdded.emit();
    taskForm.reset();
  }
}
