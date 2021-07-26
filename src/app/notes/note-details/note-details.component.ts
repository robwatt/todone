import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { Note } from 'src/app/models/note';
import { NotesService } from 'src/app/services/notes.service';
import {
  NoteAction,
  NoteActionBarComponent
} from './note-action-bar/note-action-bar.component';

@Component({
  selector: 'app-note-details',
  templateUrl: './note-details.component.html',
  styleUrls: ['./note-details.component.scss']
})
export class NoteDetailsComponent implements OnInit {
  @Input() note: Note;
  @ViewChild('actionBar') actionBar: NoteActionBarComponent;

  selectable = true;
  removeable = true;
  addOnBlur = true;
  tagCtrl = new FormControl();

  readonly separatorKeyCodes = [ENTER, COMMA] as const;
  private oldNote: Note;

  constructor(private notesService: NotesService) {}

  ngOnInit(): void {}

  /**
   * Handles the note action from the action bar
   * @param action Action the user wants to take for the note.
   */
  noteAction(action: NoteAction): void {
    switch (action) {
      case NoteAction.Edit:
        this.editNote(true);
        break;
      case NoteAction.Undo:
        this.editNote(false);
        break;
      case NoteAction.Save:
        this.save();
        break;
      case NoteAction.Archive:
        this.archive();
        break;
      case NoteAction.Delete:
        this.delete();
        break;
    }
  }

  /**
   * Adds a tag to the current note.  Does not save the current state of the note.
   * @param event Chip Input event
   */
  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value) {
      this.note.tags.push(value);
    }
    this.tagCtrl.setValue(null);
  }

  /**
   * Removes the given tag from the current note.  Does not save the current state of the note.
   * @param tag Tag to remove from the current note.
   */
  remove(tag: string): void {
    const index = this.note.tags.indexOf(tag);

    if (index >= 0) {
      this.note.tags.splice(index, 1);
    }
  }

  /**
   * Saves the current note.  This could be adding a new note, or updating an existing note with new information
   */
  private async save(): Promise<void> {
    if (this.note.id === undefined) {
      // add the new note
      const id = await this.notesService.addNote(this.note);
      this.note.id = id;
    } else {
      // just update the existing note
      this.notesService.updateNote(this.note.id, this.note);
    }
  }

  /**
   * Deletes the current Note.  Once a note is deleted the detail page should be destroyed and the list should no longer have this as a
   * selected note.
   */
  private delete(): void {
  }

  /**
   * Archives the current Note.  Archiving a Note means it will appear greyed out and can be filtered out, but the data is still available.
   */
  private archive(): void {}

  /**
   * Switches the note details to edit/view mode
   * @param edit edit mode if true, view mode if false.
   */
  private editNote(edit: boolean): void {
    if (edit) {
      this.oldNote = this.deepCopy(this.note);
    } else {
      this.note = this.oldNote;
    }
  }

  /**
   * Does a deep copy of an object.
   * @param obj Object to be deep copied
   */
  private deepCopy(obj: any): any {
    let copy: any;

    if (null === obj || 'object' !== typeof obj) {
      return obj;
    }

    // Handle Date
    if (obj instanceof Date) {
      copy = new Date();
      copy.setTime(obj.getTime());
      return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
      copy = [];
      for (let i = 0, len = obj.length; i < len; i++) {
        copy[i] = this.deepCopy(obj[i]);
      }
      return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
      copy = {};
      for (const attr in obj) {
        if (obj.hasOwnProperty(attr)) {
          copy[attr] = this.deepCopy(obj[attr]);
        }
      }
      return copy;
    }

    throw new Error(`Unable to copy obj! Its type isn't supported.`);
  }
}
