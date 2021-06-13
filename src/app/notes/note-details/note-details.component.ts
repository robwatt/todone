import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { Note } from 'src/app/models/note';
import { NotesService } from 'src/app/services/notes.service';

@Component({
  selector: 'app-note-details',
  templateUrl: './note-details.component.html',
  styleUrls: ['./note-details.component.scss']
})
export class NoteDetailsComponent implements OnInit {
  @Input() note: Note;

  selectable = true;
  removeable = true;
  addOnBlur = true;
  tagCtrl = new FormControl();

  readonly separatorKeyCodes = [ENTER, COMMA] as const;

  constructor(private notesService: NotesService) {}

  ngOnInit(): void {}

  /**
   * Saves the current note.  This could be adding a new note, or updating an existing note with new information
   */
  async save(): Promise<void> {
    if (this.note.id === undefined) {
      // add the new note
      const id = await this.notesService.addNote(this.note);
      this.note.id = id;
    }
    else {
      // just update the existing note
      this.notesService.updateNote(this.note.id, this.note);
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
}
