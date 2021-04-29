import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
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
export class StoryListComponent implements OnInit, OnDestroy {
  @Input() epic: Epic;

  stories: Story[];
  private storySub: Subscription;

  constructor(private storyService: StoryService) {
    this.storySub = this.storyService.storyItems.subscribe(
      (stories: Story[]) => (this.stories = stories)
    );
  }

  ngOnInit(): void {
    this.storyService.getStories(this.epic.id);
  }

  ngOnDestroy(): void {
    if (this.storySub) {
      this.storySub.unsubscribe();
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
  }

  drop(event: any): void {
    console.log('drop event', event);
  }
}
