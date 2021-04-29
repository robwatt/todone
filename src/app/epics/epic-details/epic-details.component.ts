import { Component, Input, OnInit } from '@angular/core';
import { Epic } from 'src/app/models/epic';

@Component({
  selector: 'app-epic-details',
  templateUrl: './epic-details.component.html',
  styleUrls: ['./epic-details.component.scss']
})
export class EpicDetailsComponent implements OnInit {

  @Input() epic: Epic;

  editMode = false;

  private oldDescription: string;

  constructor() { }

  ngOnInit(): void {
  }

  editEpic(): void {
    this.oldDescription = this.epic.description;
    this.editMode = true;
  }

  saveEpic(): void {
    this.editMode = false;
  }

  cancelEpicChanges(): void {
    this.epic.description = this.oldDescription;
    this.editMode = false;
  }
}
