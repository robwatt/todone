import { Component, Input, OnInit } from '@angular/core';
import { Epic } from 'src/app/models/epic';
import { EpicsService } from 'src/app/services/epics.service';

@Component({
  selector: 'app-epic-details',
  templateUrl: './epic-details.component.html',
  styleUrls: ['./epic-details.component.scss']
})
export class EpicDetailsComponent implements OnInit {
  @Input() epic: Epic;

  editMode = false;

  private oldDescription: string;

  constructor(private epicService: EpicsService) {}

  ngOnInit(): void {}

  /**
   * Switches the epic details to edit mode
   */
  editEpic(): void {
    this.oldDescription = this.epic.description;
    this.editMode = true;
  }

  /**
   * Saves any changes the user has made and switches back to read mode.
   */
  saveEpic(): void {
    // save epic description
    this.epicService.updateEpic(this.epic.id, {
      description: this.epic.description
    });
    this.editMode = false;
  }

  /**
   * Cancels edit mode, and reverts to the old description.
   */
  cancelEpicChanges(): void {
    this.epic.description = this.oldDescription;
    this.editMode = false;
  }
}
