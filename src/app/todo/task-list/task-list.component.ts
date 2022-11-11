import { Component, HostBinding, Input, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Filter } from 'src/app/models/filter';
import { Page } from 'src/app/models/page';
import { Task } from 'src/app/models/task';
import { TaskService } from 'src/app/services/task.service';
import { DateTime } from 'luxon';
import { MatDrawer } from '@angular/material/sidenav';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit, OnDestroy, OnChanges {
  @Input() filters: Filter[];
  @HostBinding('class') classes = 'h-full';

  @ViewChild('drawer') drawer: MatDrawer;

  tasks: Task[] = [];
  selectedTask: Task;
  groupedTasks: any = {};

  private taskSub: Subscription;

  // default value, can be changed
  private todoType = 'work';

  constructor(
    private activatedRoute: ActivatedRoute,
    private taskService: TaskService
  ) {
    this.activatedRoute.data.subscribe((value) => {
      if (value.todoType) {
        this.todoType = value.todoType;
        this.taskService.taskType = this.todoType;
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
    this.taskService.getTasks(this.filters);
  }

  /**
   * Opens the task to see more information, such as sub items
   */
  openTask(task: Task): void {
    this.selectedTask = task;
    this.taskService.openTask(task.id);
    if (!this.drawer.opened) {
      this.drawer.toggle();
    }
  }

  closeTask(): void {
    this.selectedTask = null;
    this.drawer.close();
    this.taskService.closeTask();
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
    if (this.selectedTask && taskId === this.selectedTask.id) {
      this.selectedTask = undefined;
      this.taskService.closeTask();
    }
    this.taskService.removeTask(taskId);
  }

  /**
   * Initializes the task subscription.  If it already exists, it is unsubscribed first.
   */
  private initTaskSubscription(): void {
    if (this.taskSub) {
      this.taskSub.unsubscribe();
    }
    this.taskService.taskState.subscribe((state: string) => {
      console.log('state change', state);
      if (state.startsWith('update')) {
        if (this.taskSub) {
          this.taskSub.unsubscribe();
        }
      }

      this.taskSub = this.taskService.taskItems.subscribe(
        (page: Page<Task>) => {
          if (page) {
            this.tasks = page.data;
            this.groupData();
          }
        }
      );
    });
  }

  private groupData(): void {
    const end = DateTime.now().startOf('day');

    this.groupedTasks = {};

    this.tasks.forEach((item: Task) => {
      const start = DateTime.fromJSDate(item.date.toDate()).startOf('day');

      // put the task into the correct bucket
      const index = this.compareDate(start, end);
      switch (index) {
        case 0:
          (this.groupedTasks.today = this.groupedTasks.today || []).push(item);
          break;
        case 1:
          (this.groupedTasks.yesterday =
            this.groupedTasks.yesterday || []).push(item);
          break;
        case 2:
          (this.groupedTasks.thisWeek = this.groupedTasks.thisWeek || []).push(
            item
          );
          break;
        case 3:
          (this.groupedTasks.lastWeek = this.groupedTasks.lastWeek || []).push(
            item
          );
          break;
        case 4:
          (this.groupedTasks.thisMonth =
            this.groupedTasks.thisMonth || []).push(item);
          break;
        case 5:
          (this.groupedTasks.lastMonth =
            this.groupedTasks.lastMonth || []).push(item);
          break;
        case 6:
          (this.groupedTasks.quarter = this.groupedTasks.quarter || []).push(
            item
          );
          break;
        case 7:
          (this.groupedTasks.lastQuarter =
            this.groupedTasks.lastQuarter || []).push(item);
          break;
        case 8:
          (this.groupedTasks.thisYear = this.groupedTasks.thisYear || []).push(
            item
          );
          break;
        case 9:
          (this.groupedTasks.older = this.groupedTasks.older || []).push(item);
          break;
      }
    });
  }

  /**
   * Compares the given dates, and assigns an index which can be used to bucket the task.
   * @param start Start date (provided by the task)
   * @param end End date to compare against
   */
  private compareDate(start: DateTime, end: DateTime): number {
    const duration = start.until(end).toDuration(['years', 'months', 'days']);
    if (duration.years === 0) {
      if (duration.months === 0) {
        if (duration.days === 0) {
          // today
          return 0;
        }
        if (duration.days === 1) {
          // yesterday
          return 1;
        }
        if (duration.days < 7) {
          // this week
          return 2;
        }
        if (duration.days < 14) {
          // last week
          return 3;
        }
        // this month
        return 4;
      }
      if (duration.months === 1) {
        // last month
        return 5;
      }
      if (duration.months < 3) {
        // this quarter
        return 6;
      }
      if (duration.months < 6) {
        // last quarter
        return 7;
      }
      // this year
      return 8;
    }
    // older
    return 9;
  }
}
