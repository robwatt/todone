import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { Epic } from 'src/app/models/epic';
import { Story } from 'src/app/models/story';

@Component({
  selector: 'app-stories',
  templateUrl: './stories.component.html',
  styleUrls: ['./stories.component.scss']
})
export class StoriesComponent implements OnInit, OnChanges {
  @Input() epic: Epic;

  selectedStory: Story;

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    const currentValue: Epic = changes.epic.currentValue;
    const previousValue: Epic = changes.epic.previousValue;

    if (previousValue && previousValue.id !== currentValue.id) {
      // reset selected story to close the story details since it no longer applies
      this.selectedStory = undefined;
    }
  }

  /**
   * EventListener when the selected story has changed
   * @param story New selected story
   */
  onSelectedStory(story: Story): void {
    this.selectedStory = story;
  }
}
