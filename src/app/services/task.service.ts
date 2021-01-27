import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { BehaviorSubject, Subject } from 'rxjs';
import { Task } from '../models/task';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private generatedId = 0;

  tasks: Task[] = [];
  taskSubject: Subject<Task[]>;
  subtaskSubject: Subject<Task>;

  constructor() {
    this.taskSubject = new BehaviorSubject<Task[]>(new Array<Task>());
    this.subtaskSubject = new Subject<Task>();
  }

  addTask(taskName: string): void {
    // the id would normally be generated by the DB, but don't have one right now.
    const task = {
      name: taskName,
      date: DateTime.local(),
      id: this.generatedId.toString(),
    };
    this.generatedId++;
    this.tasks.push(task);
    // return a copy of the original array, this way nobody can modify the array outside of the service.
    this.taskSubject.next(this.tasks.slice());
  }

  /**
   * Removes the specified task from the service
   * @param taskId TaskID to remove
   */
  removeTask(taskId: string): void {
    const index = this.tasks.findIndex((task: Task) => task.id === taskId);
    if (index > -1) {
      this.tasks.splice(index, 1);
    }
    // return a copy of the original array, this way nobody can modify the array outside of the service
    this.taskSubject.next(this.tasks.slice());
  }

  addSubTask(taskId: string, subtaskName: string): void {
    const index = this.tasks.findIndex((t: Task) => t.id === taskId);

    // the id would normally be generated by the DB, but don't have one right now.
    const subtask = {
      name: subtaskName,
      date: DateTime.local(),
      id: this.generatedId.toString(),
    };
    this.generatedId++;
    const parentTask = this.tasks[index];
    if (parentTask.subtask === undefined) {
      parentTask.subtask = [];
    }
    this.tasks[index].subtask?.push(subtask);
    this.subtaskSubject.next(this.tasks[index]);
  }

  /**
   * Removes a subtask from the given task
   * @param taskId Parent taskId
   * @param subtaskId Id of the subtask to remove
   */
  removeSubTask(taskId: string, subtaskId: string): void {
    const task: Task[] = this.tasks.filter((t: Task) => t.id === taskId);

    if (task.length === 1) {
      const index = task[0].subtask?.findIndex((st: Task) => st.id === subtaskId);
      if (index !== undefined && index > -1) {
        task[0].subtask?.splice(index, 1);
      }
    }
  }
}
