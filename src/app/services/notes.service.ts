import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  DocumentChangeAction,
  Query
} from '@angular/fire/firestore';
import { Subject, Subscription } from 'rxjs';
import { Note } from '../models/note';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class NotesService {
  noteItems: Subject<Note[]>;

  private notesCollection: AngularFirestoreCollection<Note>;
  private notesSubscription: Subscription;

  constructor(
    private afs: AngularFirestore,
    private auth: AuthenticationService
  ) {
    this.auth.loggedIn.subscribe((result: boolean) => {
      if (result) {
        const uid = this.auth.getUID();
        if (uid) {
          this.getNotes();
        }
      }
    });
  }

  /**
   * Adds a new note with the given title
   * @param epicTitle Title of the new note
   */
   addNote(noteTitle: string): void {
    const note = {
      title: noteTitle,
      description: '',
      tags: []
    };
    this.notesCollection.add(note);
    // refresh the list of notes - this might be a bit heavy handed for what I think will be needed,
    // I can always change it later
    this.getNotes();
  }

  /**
   * Updates an existing note with new data
   * @param noteId Note ID to update
   * @param newData New data to update. This could be partial data if needed
   */
  updateNote(noteId: string, newData: any): void {
    this.notesCollection.doc(noteId).update(newData);
    this.getNotes();
  }

  /**
   * Removes the specified note
   * @param noteId Note ID to remove
   */
  removeNote(noteId: string): void {
    this.notesCollection.doc(noteId).delete();
    this.getNotes();
  }

  private getNotes(): void {
    this.createNotesCollection();
    this.notesSubscription = this.notesCollection
    .snapshotChanges()
    .subscribe((actions: DocumentChangeAction<Note>[]) => {
      const notes: Note[] = actions.map((item) => {
        const note = item.payload.doc.data();
        note.id = item.payload.doc.id;
        return note;
      });
      this.noteItems.next(notes);
    });
  }

  private createNotesCollection(): void {
    if (this.notesSubscription) {
      this.notesSubscription.unsubscribe();
    }

    this.notesCollection = this.afs.collection<Note>(
      `users/${this.auth.getUID()}/notes`,
      (ref: Query) => ref.orderBy('title')
    );
  }
}
