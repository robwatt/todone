import { Injectable, OnDestroy } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument,
  DocumentChangeAction,
  Query
} from '@angular/fire/firestore';
import firebase from 'firebase/app';
import { cloneDeep } from 'lodash';
import { BehaviorSubject, Subject } from 'rxjs';
import { Filter } from '../models/filter';
import { Page } from '../models/page';
import { Task } from '../models/task';
import { TodoStats } from '../models/todo-stats';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class Task2Service implements OnDestroy {
  // maintains the state of the service
  taskState: Subject<string>;
  taskItems: Subject<Page<Task>>;

  private stats: TodoStats;

  private taskCollection: AngularFirestoreCollection<Task>;
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

        this.tableData = [];
        for (const item of actions) {
          this.tableData.push(item.payload.doc.data());
        }

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

        this.tableData = [];
        for (const item of response.docs) {
          this.tableData.push(item.data());
        }

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

        this.tableData = [];
        for (const item of response.docs) {
          this.tableData.push(item.data());
        }

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
