import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  DocumentChangeAction,
  Query
} from '@angular/fire/firestore';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { Epic } from '../models/epic';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class EpicsService {
  epicItems: Subject<Epic[]>;

  private epicCollection: AngularFirestoreCollection<Epic>;
  private epicSubscription: Subscription;

  constructor(
    private afs: AngularFirestore,
    private auth: AuthenticationService
  ) {
    this.epicItems = new BehaviorSubject<Epic[]>(null);

    this.auth.loggedIn.subscribe((result: boolean) => {
      if (result) {
        const uid = this.auth.getUID();
        if (uid) {
          this.getEpics();
        }
      }
    });
  }

  /**
   * Gets a complete list of all epics for the user
   */
  getEpics(): void {
    this.createEpicCollection();
    this.epicSubscription = this.epicCollection
      .snapshotChanges()
      .subscribe((actions: DocumentChangeAction<Epic>[]) => {
        const epics: Epic[] = actions.map((item) => {
          const epic = item.payload.doc.data();
          epic.id = item.payload.doc.id;
          return epic;
        });
        this.epicItems.next(epics);
      });
  }

  /**
   * Adds a new epic with the given title
   * @param epicTitle Title of the new epic
   */
  addEpic(epicTitle: string): void {
    const epic = {
      title: epicTitle,
      description: ''
    };
    this.epicCollection.add(epic);
    // refresh the list of epics - this might be a bit heavy handed for what I think will be needed,
    // I can always change it later
    this.getEpics();
  }

  /**
   * Updates an existing epic with new data
   * @param epicId Epic ID to update
   * @param newData New data to update. This could be partial data if needed
   */
  updateEpic(epicId: string, newData: any): void {
    this.epicCollection.doc(epicId).update(newData);
    this.getEpics();
  }

  /**
   * Removes the specified epic
   * @param epicId Epic ID to remove
   */
  removeEpic(epicId: string): void {
    this.epicCollection.doc(epicId).delete();
    this.getEpics();
  }

  /**
   * Creates the epic collection
   */
  private createEpicCollection(): void {
    if (this.epicSubscription) {
      this.epicSubscription.unsubscribe();
    }

    this.epicCollection = this.afs.collection<Epic>(
      `users/${this.auth.getUID()}/epics`,
      (ref: Query) => ref.orderBy('title')
    );
  }
}
