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
    console.log('drop event', event);
    // this represents the index of the item that was picked up
    const pre = event.previousIndex;
    // this represents the index that the item was dropped
    const cur = event.currentIndex;

    if (cur !== pre) {
      // we are moving the item closer to the start of the array
      const noteToMove = this.stories[pre];
      this.stories.splice(pre, 1);
      // add the note to move at the new index
      this.stories.splice(cur, 0, noteToMove);
    } else {
      // do nothing since we just dropped this on to itself
      return;
    }

    // next is to update the priority of all items in the array...there is probably not going to be a lot of stories so just redo them all
    let priority = 0;
    const updatedStories = [];
    this.stories.forEach((story) => {
      const data = {
        id: story.id,
        data: { priority }
      };
      updatedStories.push(data);
      priority = priority + 1;
    });

    this.storyService.updateStories(updatedStories);
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
      if (result !== undefined) {
        // need to update the stories name
        this.storyService.updateStory(story.id, { title: result });
      }
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
