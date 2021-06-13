import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Note } from 'src/app/models/note';

@Component({
  selector: 'app-note-list',
  templateUrl: './note-list.component.html',
  styleUrls: ['./note-list.component.scss']
})
export class NoteListComponent implements OnInit {
  @Output() note: EventEmitter<Note> = new EventEmitter<Note>();

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  constructor(private breakpointObserver: BreakpointObserver) {}

  ngOnInit(): void {}

  /**
   * This triggers the process to create a new note
   */
  createNote(): void {
    // create an empty note and display to the user
    const newNote: Note = {
      title: '',
      description: '',
      tags: []
    };

    this.note.emit(newNote);
  }
}
