import { Component, OnInit } from '@angular/core';
import { Note } from '../models/note';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss']
})
export class NotesComponent implements OnInit {
  note: Note;

  constructor() { }

  ngOnInit(): void {
  }

  selectedNote(note: Note): void {
    this.note = note;
  }
}
