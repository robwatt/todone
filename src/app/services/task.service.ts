import { Injectable, OnDestroy } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  QuerySnapshot,
} from '@angular/fire/firestore';
import firebase from 'firebase/app';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { Task } from '../models/task';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root',
})
export class TaskService implements OnDestroy {
  private taskCollection!: AngularFirestoreCollection<Task>;
  private subtaskCollection!: AngularFirestoreCollection<Task>;

  taskItems: Observable<Task[]>;
  taskSub: Subscription;
  taskSubject: Subject<Task[]>;

  subtaskItems: Observable<Task[]>;
  subtaskSub: Subscription;
  subtaskSubject: Subject<Task[]>;

  constructor(
    private afs: AngularFirestore,
    private auth: AuthenticationService
  ) {
    this.taskSubject = new BehaviorSubject<Task[]>(new Array<Task>());
    // this sends the parent task for a listener to see what subtasks have changed
    this.subtaskSubject = new Subject<Task[]>();

    this.auth.loggedIn.subscribe((result: boolean) => {
      if (result) {
        const uid = this.auth.getUID();
        if (uid) {
          this.taskCollection = this.afs.collection<Task>(`users/${uid}/todo`);
          this.taskItems = this.taskCollection.valueChanges({ idField: 'id' });
          this.taskSub = this.taskItems.subscribe((tasks: Task[]) => {
            // return a copy of the original array, this way nobody can modify the array outside of the service.
            this.taskSubject.next(tasks.slice());
          });
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.closeTask();
    if (this.taskSub) {
      this.taskSub.unsubscribe();
      this.taskSub = null;
      this.taskItems = null;
      this.taskCollection = null;
    }
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
      complete: false,
    };
    this.taskCollection.add(task);
  }

  /**
   * Removes the specified task from the service
   * @param taskId TaskID to remove
   */
  removeTask(taskId: string): void {
    this.taskCollection.doc(taskId).delete();
  }

  /**
   * Adds a subtask to the currently 'opened' task
   * @param subtaskName Subtask name/desciption to add
   */
  addSubTask(subtaskName: string): void {
    const subtask = {
      name: subtaskName,
      date: firebase.firestore.Timestamp.now(),
      complete: false,
    };
    this.subtaskCollection.add(subtask);
  }

  /**
   * Removes a subtask from the currently 'opened' task
   * @param subtaskId Id of the subtask to remove
   */
  removeSubTask(subtaskId: string): void {
    this.subtaskCollection.doc(subtaskId).delete();
  }

  /**
   * This will mark a task complete/not complete, including any subtasks.  This will mark all subtasks the same as the parent
   * @param taskId Task ID to mark complete/not complete.
   * @param complete True if the task is complete, false if the task should be marked not complete
   */
  taskComplete(taskId: string, complete: boolean): void {
    this.taskCollection.doc(taskId).update({ complete });
    // need to update all subtasks - this task may not be 'opened', which means the subtask collection is not valid to use
    const subtaskCollection = this.taskCollection
      .doc(taskId)
      .collection<Task>('subtask');
    subtaskCollection.get().subscribe((query: QuerySnapshot<Task>) => {
      query.forEach((doc) => {
        doc.ref.update({
          complete,
        });
      });
    });
  }

  /**
   * Marks a single subtask as complete/not complete.  This subtask should be in the 'opened' task.
   * @param subtaskId Subtask ID
   * @param complete True to mark task as complete, false to mark it as not complete
   */
  subtaskComplete(subtaskId: string, complete: boolean): void {
    this.subtaskCollection.doc(subtaskId).update({ complete });
  }

  /**
   * Indicates to the service that a task is being 'opened'.  This will make the service start
   * listening to the subtask collection as well.  If an existing collection was being listened to
   * it will be unscribed from.
   */
  openTask(taskId: string): void {
    // if we are adding a subtask, then this task is in view
    this.closeTask();

    this.subtaskCollection = this.taskCollection
      .doc(taskId)
      .collection('subtask');
    this.subtaskItems = this.subtaskCollection.valueChanges({ idField: 'id' });
    this.subtaskSub = this.subtaskItems.subscribe((subtasks: Task[]) => {
      this.subtaskSubject.next(subtasks.slice());
    });
  }

  /**
   * Clears any open subtask collection being listened to
   */
  private closeTask(): void {
    if (this.subtaskSub) {
      this.subtaskSub.unsubscribe();
      this.subtaskSub = null;
      this.subtaskItems = null;
      this.subtaskCollection = null;
    }
  }
}
