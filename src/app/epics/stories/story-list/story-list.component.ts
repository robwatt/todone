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
import { MatSelectionListChange } from '@angular/material/list';
import { isEmpty } from 'lodash';
import { Subscription } from 'rxjs';
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

  constructor(private storyService: StoryService) {}

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
    console.log('EVENT:: drop event', event);
  }

  /**
   * Called when the user has selected a row, or has selected a different row.
   * @param event Selection Change event.
   */
  selectionChanged(event: MatSelectionListChange): void {
    this.selectedStory.emit(event.options[0].value);
  }

  edit(event: any): void {
    console.log('edit event', event);
    event.stopPropagation();
  }

  delete(event: any): void {
    console.log('delete event', event);
    event.stopPropagation();
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
    // return true;
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
