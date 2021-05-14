import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectionListChange } from '@angular/material/list';
import { isEmpty } from 'lodash';
import { Subscription } from 'rxjs';
import { EditContentComponent } from 'src/app/common/edit-content/edit-content.component';
import { Epic } from 'src/app/models/epic';
import { Story } from 'src/app/models/story';
import { StoryService } from 'src/app/services/story.service';

@Component({
  selector: 'app-story-list',
  templateUrl: './story-list.component.html',
  styleUrls: ['./story-list.component.scss']
})
export class StoryListComponent implements OnInit, OnDestroy, OnChanges {
  @Input() epic: Epic;
  @Output() selectedStory: EventEmitter<Story> = new EventEmitter<Story>();

  stories: Story[];
  private hoverIndex: number;
  private storySub: Subscription;
  private _selectedStory: Story;

  constructor(private storyService: StoryService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.createStorySubscription();
  }

  ngOnDestroy(): void {
    if (this.storySub) {
      this.storySub.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    const currentValue: Epic = changes.epic.currentValue;
    const previousValue: Epic = changes.epic.previousValue;

    if (previousValue && previousValue.id !== currentValue.id) {
      // need to get the list of stories from the serivce
      this.createStorySubscription();
    }
  }

  /**
   * Adds a new story to the epic
   * @param form Form that has the story title in it.
   */
  addStory(form: NgForm): void {
    const storyTitle = form.value.story;
    if (isEmpty(storyTitle)) {
      form.form.controls.story.setErrors({ invalid: true });
      return;
    }

    const story: Story = {
      title: storyTitle,
      description: '',
      needsRefinement: false,
      priority: 0,
      mvp: false
    };
    this.storyService.addStory(story);
    // reset the form for the next story to be added
    form.form.controls.story.reset();
  }

  /**
   * This is called when the user drags and drops a row in the list
   * @param event dnd event.
   */
  drop(event: any): void {
    // this represents the index of the item that was picked up
    const pre = event.previousIndex;
    // this represents the index that the item was dropped
    const cur = event.currentIndex;

    // determine what is the start index and what is the end index
    const start = pre < cur ? pre : cur;
    const end = pre < cur ? cur : pre;
    const startPriority = this.stories[start].priority;

    // create a subset of stories that encompass that part of the array the user is moving
    // the story from => to; we don't need anything outside of this.
    let storySubset = this.stories.splice(start, end - start + 1);
    // switch first and last index
    storySubset = this.swap(storySubset);

    // create partial story updates and put in a map for batch update
    const updatedStories = [];
    let priorityCounter: number = startPriority;
    storySubset.forEach((story) => {
      const data = {
        id: story.id,
        data: { priority: priorityCounter }
      };
      updatedStories.push(data);
      priorityCounter = priorityCounter + 1;
    });
    if (updatedStories.length > 0) {
      this.storyService.updateStories(updatedStories);
    }
  }

  /**
   * Called when the user has selected a row, or has selected a different row.
   * @param event Selection Change event.
   */
  selectionChanged(event: MatSelectionListChange): void {
    this._selectedStory = event.options[0].value;
  }

  /**
   * Update the title of the story
   * @param event MouseEvent
   * @param story Story the user is trying to update the title of
   */
  edit(event: MouseEvent, story: Story): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(EditContentComponent, {
      width: '500px',
      data: { name: story.title, title: 'Edit story', label: 'Story name' }
    });

    dialogRef.afterClosed().subscribe((result) => {
      // need to update the stories name
      this.storyService.updateStory(story.id, { title: result });
    });
  }

  /**
   * Deletes the selected story
   * @param event MouseEvent
   * @param story Story to be deleted
   */
  delete(event: MouseEvent, story: Story): void {
    event.stopPropagation();
    this.storyService.deleteStory(story.id);
  }

  /**
   * When the mouse enters the item, we can turn the menu buttons on
   * @param event MouseEvent
   * @param hoverIndex index that the mouse is entering
   */
  mouseEnter(event: MouseEvent, hoverIndex: number): void {
    this.hoverIndex = hoverIndex;
  }

  /**
   * When the mouse leaves the item, we can turn the menu buttons off
   * @param event MouseEvent
   * @param hoverIndex index that the mouse is leaving
   */
  mouseLeave(event: MouseEvent, hoverIndex: number): void {
    if (hoverIndex === this.hoverIndex) {
      this.hoverIndex = -1;
    }
  }

  /**
   * Called to determine if the menu should be shown on the story list
   * @param index Index the mouse is hovering over.
   */
  showMenu(index: number): boolean {
    return this.hoverIndex === index;
  }

  onListClick(): void {
    this.selectedStory.emit(this._selectedStory);
  }

  /**
   * Swaps the first and last elements of the provided array
   * @param array Array to swap elements of
   */
  private swap(array: any): [] {
    [array[0], array[array.length - 1]] = [array[array.length - 1], array[0]];
    return array;
  }

  /**
   * Creates a story subscription to whatever the current epic is
   */
  private createStorySubscription(): void {
    if (this.storySub) {
      this.storySub.unsubscribe();
    }
    // get the stories associated to the epic
    this.storyService.getStories(this.epic.id);
    // subscribe to the stories, so if there are any changes to them we will be told.
    this.storySub = this.storyService.storyItems.subscribe(
      (stories: Story[]) => (this.stories = stories)
    );
  }
}
