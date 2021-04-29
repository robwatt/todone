import { Component, Input, OnInit } from '@angular/core';
import { Epic } from 'src/app/models/epic';

@Component({
  selector: 'app-stories',
  templateUrl: './stories.component.html',
  styleUrls: ['./stories.component.scss']
})
export class StoriesComponent implements OnInit {
  @Input() epic: Epic;

  constructor() { }

  ngOnInit(): void {
  }

}
