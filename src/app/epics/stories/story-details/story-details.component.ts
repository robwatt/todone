import { Component, Input, OnInit } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Story } from 'src/app/models/story';
import { StoryService } from 'src/app/services/story.service';

@Component({
  selector: 'app-story-details',
  templateUrl: './story-details.component.html',
  styleUrls: ['./story-details.component.scss']
})
export class StoryDetailsComponent implements OnInit {
  @Input() story: Story;

  editMode = false;

  private oldDescription: string;

  constructor(private storyService: StoryService) {}

  ngOnInit(): void {}

  /**
   * Triggered when the user toggles the MVP slider.  This indicates if the story is required for MVP.
   * @param event Event containing the state of the slider
   */
  toggleMvp(event: MatSlideToggleChange): void {
    this.storyService.updateStory(this.story.id, { mvp: event.checked });
  }

  /**
   * Triggered when the user toggles the 'needs refinement' slider.  This indicates the story may need further refinement.
   * @param event Event containing the state of the slider
   */
  toggleNeedsRefinement(event: MatSlideToggleChange): void {
    this.storyService.updateStory(this.story.id, {
      needsRefinement: event.checked
    });
  }

  /**
   * Switches the story details to edit mode
   */
  editStory(): void {
    this.oldDescription = this.story.description;
    this.editMode = true;
  }

  /**
   * Saves any changes the user has made and switches back to read mode.
   */
  saveStoryDescription(): void {
    // save epic description
    this.storyService.updateStory(this.story.id, {
      description: this.story.description
    });
    this.editMode = false;
  }

  /**
   * Cancels edit mode, and reverts to the old description.
   */
  cancelStoryChanges(): void {
    this.story.description = this.oldDescription;
    this.editMode = false;
  }
}
