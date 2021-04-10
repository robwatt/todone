import { Injectable, OnDestroy } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  DocumentChangeAction,
  Query,
  QuerySnapshot
} from '@angular/fire/firestore';
import firebase from 'firebase/app';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { Filter } from '../models/filter';
import { Page } from '../models/page';
import { Task } from '../models/task';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService implements OnDestroy {
  // maintains the state of the service
  taskState: Subject<string>;
  // TODO: change the type from Page to just Task[]
  taskItems: Subject<Page<Task>>;

  private taskCollection: AngularFirestoreCollection<Task>;
  private taskColSubscription: Subscription;
  private subtaskCollection: AngularFirestoreCollection<Task>;

  // subtask related fields
  subtaskItems: Subject<Task[]>;
  private subtaskSubscription: Subscription;

  // default task type incase one isn't provided
  private _taskType = 'work';
  private filters: Filter[];
  private tableData: Task[];

  constructor(
    private afs: AngularFirestore,
    private auth: AuthenticationService
  ) {
    this.taskState = new BehaviorSubject<string>('uninitialized');
    this.taskItems = new BehaviorSubject<Page<Task>>(null);

    this.auth.loggedIn.subscribe((result: boolean) => {
      if (result) {
        const uid = this.auth.getUID();
        if (uid) {
          // this value needs to be initialized at the beginning and only destroyed when we close the
          // task, or destroy the service
          this.subtaskItems = new BehaviorSubject<Task[]>(null);
          this.getTasks();
          // TODO - turn this into constants
          this.taskState.next('initialized');
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.closeTask();
    this.taskState.next('destroyed');
    this.taskState.complete();
    this.taskState = null;
    this.taskItems.complete();
  }

  /**
   * Sets the task category the user wants to get from the database (work, personal, etc...).
   */
  set taskType(type: string) {
    this._taskType = type;
  }

  /**
   * Gets the list of tasks based on the provided filters
   * @param filters Filters used to reduce the returned data set
   */
  getTasks(filters?: Filter[]): void {
    this.filters = filters;

    this.createCollection();
    this.taskColSubscription = this.taskCollection
      .snapshotChanges()
      .subscribe((actions: DocumentChangeAction<Task>[]) => {
        // create page to send back
        const page: Page<Task> = {
          data: [],
          total: 0
        };

        if (!actions.length) {
          console.log('No Data Available');
          this.taskItems.next(page);
        }

        // map the data returned from the snaptshot, set the ID and gather in an array
        this.tableData = actions.map((item) => {
          const task = item.payload.doc.data();
          task.id = item.payload.doc.id;
          return task;
        });

        // create page to send back
        page.data = this.tableData;
        page.total = this.tableData.length;
        this.taskItems.next(page);
      });
  }

  /**
   * Adds a main task with the given name/description
   * @param taskName Description of the task to add
   */
  addTask(taskName: string): void {
    const task = {
      name: taskName,
      date: firebase.firestore.Timestamp.now(),
      complete: false
    };

    this.taskCollection.add(task);
    // refresh the list of tasks now that we just added a new task
    this.getTasks(this.filters);
  }

  /**
   * Updates the parent task with the new provided data.
   * @param taskId Parent task IDs
   * @param newData New data to update the task with (this is partial data)
   */
  updateTask(taskId: string, newData: any): void {
    this.taskCollection.doc(taskId).update(newData);

    // refresh the list
    this.getTasks(this.filters);
  }

  /**
   * Removes the specified task from the service
   * @param taskId TaskID to remove
   */
  removeTask(taskId: string): void {
    this.taskCollection.doc(taskId).delete();

    // refresh the list
    this.getTasks(this.filters);
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
      .collection<Task>('subtask', (ref) => ref.orderBy('date'));
    subtaskCollection.get().subscribe((query: QuerySnapshot<Task>) => {
      query.forEach((doc) => {
        doc.ref.update({
          complete
        });
      });
    });

    // TODO: refresh the current page
    this.getTasks(this.filters);
  }

  // SUBTASK related services

  /**
   * Indicates to the service that a task is being 'opened'.  This will make the service start
   * listening to the subtask collection as well.  If an existing collection was being listened to
   * it will be unscribed from.
   */
  openTask(taskId: string): void {
    // if we are adding a subtask, then this task is in view
    this.subtaskCollection = this.taskCollection
      .doc(taskId)
      .collection('subtask', (ref: Query) => ref.orderBy('date'));
    const collection = this.subtaskCollection.valueChanges({ idField: 'id' });
    this.subtaskSubscription = collection.subscribe((subtasks: Task[]) => {
      this.subtaskItems.next(subtasks.slice());
    });
  }

  /**
   * Updates the subtask with the new provided data
   * @param subtaskId Subtask task ID
   * @param newData New data to update the task with (this is partial data)
   */
  updateSubtask(subtaskId: string, newData: any): void {
    this.subtaskCollection.doc(subtaskId).update(newData);
  }

  /**
   * Adds a subtask to the currently 'opened' task
   * @param subtaskName Subtask name/desciption to add
   */
  addSubTask(subtaskName: string): void {
    const subtask = {
      name: subtaskName,
      date: firebase.firestore.Timestamp.now(),
      complete: false
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
   * Marks a single subtask as complete/not complete.  This subtask should be in the 'opened' task.
   * @param subtaskId Subtask ID
   * @param complete True to mark task as complete, false to mark it as not complete
   */
  subtaskComplete(subtaskId: string, complete: boolean): void {
    this.subtaskCollection.doc(subtaskId).update({ complete });
  }

  /**
   * Clears any open subtask collection being listened to
   */
  closeTask(): void {
    if (this.subtaskItems) {
      this.subtaskSubscription.unsubscribe();
      this.subtaskItems.unsubscribe();
      this.subtaskItems = null;
      this.subtaskCollection = null;
    }
  }

  /**
   * Creates the collection that is used for CRUD operations
   * @param filters Possible list of filters to apply.
   */
  private createCollection(): void {
    // unsubscribe from collection subscription first
    if (this.taskColSubscription) {
      this.taskColSubscription.unsubscribe();
    }
    const uid = this.auth.getUID();
    const filters = this.filters;
    this.taskCollection = this.afs.collection<Task>(
      `users/${uid}/todo-${this._taskType}`,
      (ref: Query) => {
        let q = ref;
        if (filters && filters.length === 1) {
          q = q.where(
            filters[0].dbField,
            filters[0].dbOperation,
            filters[0].dbValue
          );
        }
        q = q.orderBy('date', 'desc');
        return q;
      }
    );
  }
}
