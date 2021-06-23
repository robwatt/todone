import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Note } from 'src/app/models/note';

/**
 * Enum for the note action.  This will be used in the event emitters.
 */
export enum NoteAction {
  Edit,
  Save,
  Archive,
  Undo,
  View
}

@Component({
  selector: 'app-note-action-bar',
  templateUrl: './note-action-bar.component.html',
  styleUrls: ['./note-action-bar.component.scss']
})
export class NoteActionBarComponent implements OnInit {
  @Input() note: Note;
  @Output() action: EventEmitter<NoteAction> = new EventEmitter();

  editMode = false;

  constructor() {}

  ngOnInit(): void {}

  /**
   * Switches the note details edit on
   */
  enableEdit(): void {
    this.editMode = true;
    this.action.emit(NoteAction.Edit);
  }

  /**
   * Cancels editing the note. This should undo any changes and not save them.
   */
  cancelEdit(): void {
    this.editMode = false;
    this.action.emit(NoteAction.Undo);
  }

  /**
   * Let's the parent know that the user wants to save the contents of the note.
   */
  save(): void {
    // exit edit mode and enter view mode
    this.editMode = false;
    this.action.emit(NoteAction.Save);
  }

  /**
   * Called when the user presses the archive action
   */
  archive(): void {
    this.editMode = false;
    this.action.emit(NoteAction.Archive);
  }
}
