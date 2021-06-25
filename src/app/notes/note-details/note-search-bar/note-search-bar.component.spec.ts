import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoteSearchBarComponent } from './note-search-bar.component';

describe('NoteActionBarComponent', () => {
  let component: NoteSearchBarComponent;
  let fixture: ComponentFixture<NoteSearchBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NoteSearchBarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NoteSearchBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
