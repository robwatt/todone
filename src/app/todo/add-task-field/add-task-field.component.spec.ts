import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTaskFieldComponent } from './add-task-field.component';

describe('AddTaskFieldComponent', () => {
  let component: AddTaskFieldComponent;
  let fixture: ComponentFixture<AddTaskFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddTaskFieldComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTaskFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
