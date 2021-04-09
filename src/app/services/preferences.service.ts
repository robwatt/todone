import { Injectable, OnDestroy } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreDocument,
  DocumentSnapshot
} from '@angular/fire/firestore';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { AuthenticationService } from './authentication.service';

/**
 * Manages the user preferences throughout the application
 */
@Injectable({
  providedIn: 'root'
})
export class PreferencesService implements OnDestroy {
  taskPrefSubject: Subject<any>;

  private taskPrefSubscription: Subscription;
  private taskPreferencesDoc: AngularFirestoreDocument<any>;
  private taskPreferences: any;

  constructor(
    private afs: AngularFirestore,
    private auth: AuthenticationService
  ) {
    this.taskPrefSubject = new BehaviorSubject<any>(null);
    this.auth.loggedIn.subscribe((result: boolean) => {
      if (result) {
        const uid = this.auth.getUID();
        if (uid) {
          this.initPreferences();
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.taskPrefSubject) {
      this.taskPrefSubscription.unsubscribe();
      this.taskPrefSubject.unsubscribe();
      this.taskPreferencesDoc = null;
    }
  }

  /**
   * Updates the todo preferences document, or creates it if it doesn't yet exist
   * @param preferences Partial preferences object (just the values that will change)
   */
  updateTaskPreferences(preferences: any): void {
    if (this.taskPreferences) {
      // update the document
      this.taskPreferencesDoc.update(preferences);
    } else {
      // create the document
      this.taskPreferencesDoc.set(preferences);
    }
  }

  private initPreferences(): void {
    const uid = this.auth.getUID();
    const preferencesCollection = this.afs.collection(
      `users/${uid}/preferences`
    );
    this.taskPreferencesDoc = preferencesCollection.doc<any>('todo');

    this.taskPreferencesDoc
      .get()
      .subscribe((document: DocumentSnapshot<any>) => {
        if (document.exists) {
          this.taskPreferences = document.data();
          this.taskPrefSubject.next(this.taskPreferences);
        }
      });
  }
}
