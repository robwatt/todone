import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Filter } from '../models/filter';
import { PreferencesService } from '../services/preferences.service';

interface TodoInterface {
  routeParam: string;
  title: string;
}

const todo: TodoInterface[] = [
  { routeParam: 'work', title: 'Work' },
  { routeParam: 'personal', title: 'Personal' }
];

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.scss']
})
export class TodoComponent implements OnInit, OnDestroy {
  title: string;
  taskFilters: Filter[];

  private preferencesSubscription: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
    private snackBar: MatSnackBar,
    private preferencesService: PreferencesService
  ) {
    this.activatedRoute.data.subscribe((value) => {
      if (value.todoType) {
        const todoValue: TodoInterface = todo.find(
          (v) => v.routeParam === value.todoType
        );
        if (todoValue) {
          this.title = todoValue.title;
        }
      }
    });
  }

  ngOnInit(): void {
    this.preferencesSubscription =
      this.preferencesService.taskPrefSubject.subscribe((preferences: any) => {
        if (preferences) {
          this.taskFilters = preferences.filters;
        }
      });
  }

  ngOnDestroy(): void {
    if (this.preferencesSubscription) {
      this.preferencesSubscription.unsubscribe();
    }
  }

  /**
   * Called once a task has been added successfully
   */
  taskAdded(): void {
    this.snackBar.open('Task added', 'Dismiss', {
      duration: 3000
    });
  }

  /**
   * Called when the user applies a task filter
   * @param event Event with the filters the user applied
   */
  appliedFiltersChanged(event: Event): void {
    this.preferencesService.updateTaskPreferences({ filters: event });
    this.taskFilters = event as any;
  }
}
