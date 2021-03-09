import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Filter } from 'src/app/models/filter';
import { Task } from 'src/app/models/task';
import { TaskService } from 'src/app/services/task.service';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit, OnDestroy, OnChanges {
  @Input() filters: Filter[];

  tasks: Task[] = [];
  selectedTask: Task[] = [];

  private taskSub: Subscription;

  // default value, can be changed
  private todoType = 'work';

  constructor(private taskService: TaskService, private activatedRoute: ActivatedRoute) {
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

  ngOnChanges(changes: SimpleChanges): void {
    this.taskService.getTasks(this.filters);
  }

  private initTaskSubscription(): void {
    if (this.taskSub) {
      this.taskSub.unsubscribe();
    }
    this.taskService.taskState.subscribe((state: string) => {
      if (state === 'initialized') {
        this.taskSub = this.taskService.taskItems.subscribe((tasks: Task[]) => {
          this.tasks = tasks;
        });
      } else if (state.startsWith('update')) {
        if (this.taskSub) {
          this.taskSub.unsubscribe();
        }
        this.taskSub = this.taskService.taskItems.subscribe((tasks: Task[]) => {
          this.tasks = tasks;
        });
      }
    });
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
}
