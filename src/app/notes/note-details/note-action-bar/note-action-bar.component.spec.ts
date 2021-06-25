import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoteActionBarComponent } from './note-action-bar.component';

describe('NoteActionBarComponent', () => {
  let component: NoteActionBarComponent;
  let fixture: ComponentFixture<NoteActionBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NoteActionBarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NoteActionBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
