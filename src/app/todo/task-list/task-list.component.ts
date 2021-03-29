import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Filter } from 'src/app/models/filter';
import { Page } from 'src/app/models/page';
import { Task } from 'src/app/models/task';
import { TaskService } from 'src/app/services/task.service';
import { Task2Service } from 'src/app/services/task2.service';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit, OnDestroy, OnChanges {
  @Input() filters: Filter[];

  totalLength: number;
  tasks: Task[] = [];
  selectedTask: Task[] = [];

  private taskSub: Subscription;

  // default value, can be changed
  private todoType = 'work';

  constructor(
    private taskService: TaskService,
    private activatedRoute: ActivatedRoute,
    private task2Service: Task2Service
  ) {
    this.activatedRoute.data.subscribe((value) => {
      if (value.todoType) {
        this.todoType = value.todoType;
        this.task2Service.taskType = this.todoType;
      }
    });
  }

  ngOnInit(): void {
    this.initTaskSubscription();
  }

  ngOnDestroy(): void {
    if (this.taskSub) {
      this.taskSub.unsubscribe();
    }
  }

  ngOnChanges(): void {
    this.task2Service.getTasks(this.filters);
  }

  /**
   * Event called when the paginator is updated, we will request a new page of data to display
   * @param pageEvent PageEvent
   */
  pageEvent(pageEvent: PageEvent): void {
    const pageIndex = pageEvent.pageIndex;
    const prevPageIndex = pageEvent.previousPageIndex;
    if (pageIndex > prevPageIndex) {
      this.task2Service.nextPage();
    } else if (pageIndex < prevPageIndex) {
      this.task2Service.prevPage();
    } else {
      // test if the page size has changed
    }
  }

  /**
   * Opens the task to see more information, such as sub items
   */
  openTask(task: Task): void {
    this.selectedTask = [task];
    this.taskService.openTask(task.id);
  }

  /**
   * Marks the task as complete.
   * @param taskId Task ID to mark as completed
   */
  complete(taskId: string): void {
    this.taskService.taskComplete(taskId, true);
  }

  /**
   * Marks the task as not completed.
   * @param taskId Task ID to mark as not completed
   */
  uncomplete(taskId: string): void {
    this.taskService.taskComplete(taskId, false);
  }

  /**
   * Deletes a task from the list
   * @param taskId Task ID to delete
   */
  delete(taskId: string): void {
    // if the task to be deleted is also selected, reset the selection, this will hide the subtask panel.
    if (this.selectedTask[0] && taskId === this.selectedTask[0].id) {
      this.selectedTask = [];
    }
    this.taskService.removeTask(taskId);
  }

  private initTaskSubscription(): void {
    if (this.taskSub) {
      this.taskSub.unsubscribe();
    }
    this.task2Service.taskState.subscribe((state: string) => {
      console.log('state change', state);
      if (state === 'initialized') {
        this.taskSub = this.task2Service.taskItems.subscribe(
          (page: Page<Task>) => {
            if (page) {
              this.tasks = page.data;
              this.totalLength = page.total;
            }
          }
        );
      } else if (state.startsWith('update')) {
        if (this.taskSub) {
          this.taskSub.unsubscribe();
        }
        this.taskSub = this.task2Service.taskItems.subscribe(
          (page: Page<Task>) => {
            if (page) {
              this.tasks = page.data;
              this.totalLength = page.total;
            }
          }
        );
      }
    });
  }
}
