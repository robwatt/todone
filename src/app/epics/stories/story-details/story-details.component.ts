import { Component, Input, OnInit } from '@angular/core';
import { Story } from 'src/app/models/story';

@Component({
  selector: 'app-story-details',
  templateUrl: './story-details.component.html',
  styleUrls: ['./story-details.component.scss']
})
export class StoryDetailsComponent implements OnInit {
  @Input() story: Story;

  constructor() {}

  ngOnInit(): void {}
}
