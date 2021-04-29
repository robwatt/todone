import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEpicDialogComponent } from './create-epic-dialog.component';

describe('CreateEpicDialogComponent', () => {
  let component: CreateEpicDialogComponent;
  let fixture: ComponentFixture<CreateEpicDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateEpicDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateEpicDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
