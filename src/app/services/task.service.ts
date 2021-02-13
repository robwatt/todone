import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/firestore';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Task } from '../models/task';
import { AuthenticationService } from './authentication.service';
import firebase from 'firebase/app';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private generatedId = 0;

  private taskCollection!: AngularFirestoreCollection<Task>;

  tasks: Task[] = [];
  taskItems!: Observable<Task[]>;
  taskSubject: Subject<Task[]>;
  subtaskSubject: Subject<Task>;

  constructor(
    private afs: AngularFirestore,
    private auth: AuthenticationService
  ) {
    this.taskSubject = new BehaviorSubject<Task[]>(new Array<Task>());
    // this sends the parent task for a listener to see what subtasks have changed
    this.subtaskSubject = new Subject<Task>();

    this.auth.loggedIn.subscribe((result: boolean) => {
      if (result) {
        const uid = this.auth.getUID();
        if (uid) {
          this.taskCollection = this.afs.collection<Task>(uid);
          this.taskItems = this.taskCollection.valueChanges({ idField: 'id' });
          this.taskItems.subscribe((tasks: Task[]) => {
            this.tasks = tasks;
            // return a copy of the original array, this way nobody can modify the array outside of the service.
            this.taskSubject.next(this.tasks.slice());
          });
        }
      }
    });
  }

  /**
   * Adds a main task with the given name/description
   * @param taskName Description of the task to add
   */
  addTask(taskName: string): void {
    // the id would normally be generated by the DB, but don't have one right now.
    const task = {
      name: taskName,
      date: firebase.firestore.Timestamp.now(),
      id: '',
      complete: false,
    };
    this.taskCollection.add(task);
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

  /**
   * Adds a subtask to the given parent task
   * @param taskId Parent taskID to associate the new subtask to
   * @param subtaskName Subtask name/desciption to add
   */
  addSubTask(taskId: string, subtaskName: string): void {
    const index = this.tasks.findIndex((t: Task) => t.id === taskId);

    // the id would normally be generated by the DB, but don't have one right now.
    const subtask = {
      name: subtaskName,
      date: firebase.firestore.Timestamp.now(),
      id: this.generatedId.toString(),
      complete: false,
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
      const index = task[0].subtask?.findIndex(
        (st: Task) => st.id === subtaskId
      );
      if (index !== undefined && index > -1) {
        task[0].subtask?.splice(index, 1);
      }
    }
  }

  /**
   * This will mark a task complete/not complete, including any subtasks.  This will mark all subtasks the same as the parent
   * @param taskId Task ID to mark complete/not complete.
   * @param complete True if the task is complete, false if the task should be marked not complete
   */
  taskComplete(taskId: string, complete: boolean): void {
    const task: Task[] = this.tasks.filter((t: Task) => t.id === taskId);

    if (task.length === 1) {
      task[0].complete = complete;
      this.taskSubject.next(this.tasks.slice());
      // mark all subtasks as complete as well
      if (task[0].subtask) {
        task[0].subtask.forEach((subtask: Task) => {
          subtask.complete = complete;
        });
        this.subtaskSubject.next(task[0]);
      }
    }
  }

  /**
   * Marks a subtask as complete/not complete
   * @param parentTaskId Parent task ID
   * @param subtaskId Subtask ID
   * @param complete True to mark task as complete, false to mark it as not complete
   */
  subtaskComplete(
    parentTaskId: string,
    subtaskId: string,
    complete: boolean
  ): void {
    const task: Task[] = this.tasks.filter((t: Task) => t.id === parentTaskId);
    if (task.length === 1) {
      if (task[0].subtask) {
        // find the subtask
        const subtask: Task[] = task[0].subtask.filter(
          (st: Task) => st.id === subtaskId
        );
        if (subtask.length === 1) {
          subtask[0].complete = complete;
          this.subtaskSubject.next(task[0]);
        }
      }
    }
  }
}
