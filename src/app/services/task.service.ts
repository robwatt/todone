import { isNgTemplate } from '@angular/compiler';
import { Injectable, OnDestroy } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument,
  DocumentChangeAction,
  Query,
  QuerySnapshot
} from '@angular/fire/firestore';
import firebase from 'firebase/app';
import { cloneDeep } from 'lodash';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { Filter } from '../models/filter';
import { Page } from '../models/page';
import { Task } from '../models/task';
import { TodoStats } from '../models/todo-stats';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService implements OnDestroy {
  // maintains the state of the service
  taskState: Subject<string>;
  taskItems: Subject<Page<Task>>;

  // subtask related fields
  subtaskItems: Subject<Task[]>;
  private subtaskSubscription: Subscription;

  private stats: TodoStats;

  private taskCollection: AngularFirestoreCollection<Task>;
  private subtaskCollection: AngularFirestoreCollection<Task>;

  private statsDoc: AngularFirestoreDocument<TodoStats>;

  private filters: Filter[];

  // default task type incase one isn't provided
  private _taskType = 'work';

  // PAGE STATE
  // tableData will contains the document items get from collection
  private tableData: Task[] = [];

  // save first document in snapshot of items received
  private firstInResponse: Task;

  // save last document in snapshot of items received
  private lastInResponse: Task;

  // keep the array of first document of previous pages
  private prevStrtAt: Task[];

  constructor(
    private afs: AngularFirestore,
    private auth: AuthenticationService
  ) {
    this.taskState = new BehaviorSubject<string>('uninitialized');
    this.taskItems = new BehaviorSubject<Page<Task>>(null);
    // this sends the parent task for a listener to see what subtasks have changed
    // this.subtaskSubject = new Subject<Task[]>();

    this.auth.loggedIn.subscribe((result: boolean) => {
      if (result) {
        const uid = this.auth.getUID();
        if (uid) {
          this.getTodoStats();
          this.initializeCollections();
          this.getTasks();
          // TODO - turn this into constants
          this.taskState.next('initialized');
        }
      }
    });
  }

  ngOnDestroy(): void {
    // this.closeTask();
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
    // reset the collections because the task type has changed and this directly impacts the collection we are using.
    this.initializeCollections();
  }

  /**
   * Gets a snapshot of tasks with all the metadata
   * @param filters Filters to apply to the query
   */
  getTasks(filters?: Filter[]): void {
    const uid = this.auth.getUID();
    this.filters = filters;

    this.afs
      .collection<Task>(`users/${uid}/todo-${this._taskType}`, (ref: Query) => {
        let q = ref;
        if (filters && filters.length === 1) {
          q = q.where(
            filters[0].dbField,
            filters[0].dbOperation,
            filters[0].dbValue
          );
        }
        q = q.limit(10).orderBy('date');
        return q;
      })
      .snapshotChanges()
      .subscribe((actions: DocumentChangeAction<Task>[]) => {
        if (!actions.length) {
          console.log('No Data Available');
          return false;
        }
        this.firstInResponse = actions[0].payload.doc.data();
        this.lastInResponse = actions[actions.length - 1].payload.doc.data();

        // map the data returned from the snaptshot, set the ID and gather in an array
        this.tableData = actions.map((item) => {
          const task = item.payload.doc.data();
          task.id = item.payload.doc.id;
          return task;
        });

        // create page to send back
        const page: Page<Task> = {
          data: this.tableData,
          total: this.stats.count[this._taskType]
        };

        this.taskItems.next(page);

        // initialize values
        this.prevStrtAt = [];

        this.pushPrevStartAt(this.firstInResponse);
      });
  }

  /**
   * Gets the next page of tasks
   */
  nextPage(): void {
    console.log('next page');
    const uid = this.auth.getUID();
    const filters = this.filters;
    this.afs
      .collection<Task>(`users/${uid}/todo-${this._taskType}`, (ref: Query) => {
        let q = ref;
        if (filters && filters.length === 1) {
          q = q.where(
            filters[0].dbField,
            filters[0].dbOperation,
            filters[0].dbValue
          );
        }
        // when doing a startAfter, you NEED an orderBy that is the same field being used for the startAfter
        // in this case it's date.  If at a later point I allow sorting, the startAfter will need to change
        q = q.limit(10).orderBy('date').startAfter(this.lastInResponse.date);
        return q;
      })
      .get()
      .subscribe((response: firebase.firestore.QuerySnapshot<Task>) => {
        if (!response.docs.length) {
          console.log('No More Data Available');
          return;
        }
        this.firstInResponse = response.docs[0].data();
        this.lastInResponse = response.docs[response.docs.length - 1].data();

        // map the data returned from the snaptshot, set the ID and gather in an array
        this.tableData = response.docs.map((item) => {
          const task = item.data();
          task.id = item.id;
          return task;
        });

        // create page to send back
        const page: Page<Task> = {
          data: this.tableData,
          total: this.stats.count[this._taskType]
        };

        this.taskItems.next(page);

        this.pushPrevStartAt(this.firstInResponse);
      });
  }

  /**
   * Gets the previous page of tasks.
   */
  prevPage(): void {
    const uid = this.auth.getUID();
    const filters = this.filters;
    this.afs
      .collection<Task>(`users/${uid}/todo-${this._taskType}`, (ref: Query) => {
        let q = ref;
        if (filters && filters.length === 1) {
          q = q.where(
            filters[0].dbField,
            filters[0].dbOperation,
            filters[0].dbValue
          );
        }
        // when doing a startAfter, you NEED an orderBy that is the same field being used for the endBefore
        // in this case it's date.  If at a later point I allow sorting, the endBefore will need to change
        q = q.limit(10).orderBy('date').endBefore(this.firstInResponse.date);
        return q;
      })
      .get()
      .subscribe((response: firebase.firestore.QuerySnapshot<Task>) => {
        this.firstInResponse = response.docs[0].data();
        this.lastInResponse = response.docs[response.docs.length - 1].data();

        // map the data returned from the snaptshot, set the ID and gather in an array
        this.tableData = response.docs.map((item) => {
          const task = item.data();
          task.id = item.id;
          return task;
        });

        this.popPrevStartAt(this.firstInResponse);

        // create page to send back
        const page: Page<Task> = {
          data: this.tableData,
          total: this.stats.count[this._taskType]
        };

        this.taskItems.next(page);
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
      complete: false
    };

    // create a batch update that will add the new task as well as update the count
    const batch = this.afs.firestore.batch();
    const newDocRef = this.taskCollection.doc().ref;
    batch.set(newDocRef, task);

    // update the stats
    const statUpdate = cloneDeep(this.stats);
    // increase the total count of this taskType by 1
    statUpdate.count[this._taskType] = this.stats.count[this._taskType] + 1;
    batch.update(this.statsDoc.ref, statUpdate);

    batch.commit();

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
    // create a batch update that will add the new task as well as update the count
    const batch = this.afs.firestore.batch();
    const uid = this.auth.getUID();

    // need a reference to the document that is to be deleted
    const ref = this.afs
      .collection<Task>(`users/${uid}/todo-${this._taskType}`)
      .doc(taskId).ref;
    batch.delete(ref);

    // update the stats
    const statUpdate = cloneDeep(this.stats);
    // decrease the total count of this taskType by 1
    statUpdate.count[this._taskType] = this.stats.count[this._taskType] - 1;
    batch.update(this.statsDoc.ref, statUpdate);

    batch.commit();

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
    this.closeTask();

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
  private closeTask(): void {
    if (this.subtaskItems) {
      this.subtaskSubscription.unsubscribe();
      this.subtaskItems.unsubscribe();
      this.subtaskItems = null;
      this.subtaskCollection = null;
    }
  }

  /**
   * Initializes any collections we need to use.
   */
  private initializeCollections(): void {
    const uid = this.auth.getUID();
    this.taskCollection = this.afs.collection<Task>(
      `users/${uid}/todo-${this._taskType}`
    );

    this.statsDoc = this.afs
      .collection<TodoStats>(`users/${uid}/stats`)
      .doc(`todo-stats`);
  }

  /**
   * Get the todo-stats document.  This will contain things like the number of todo items for each type of todo category
   */
  private getTodoStats(): void {
    const uid = this.auth.getUID();

    this.afs
      .doc<TodoStats>(`users/${uid}/stats/todo-stats`)
      .valueChanges()
      .subscribe((stats: TodoStats) => {
        this.stats = stats;
      });
  }

  private pushPrevStartAt(prevFirstDoc: Task): void {
    this.prevStrtAt.push(prevFirstDoc);
  }

  private popPrevStartAt(prevFirstDoc: Task): void {
    this.prevStrtAt.forEach((element: Task) => {
      if (prevFirstDoc.date === element.date) {
        element = null;
      }
    });
  }
}
