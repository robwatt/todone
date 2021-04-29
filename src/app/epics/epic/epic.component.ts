import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Epic } from 'src/app/models/epic';
import { EpicsService } from 'src/app/services/epics.service';
import { CreateEpicDialogComponent } from './create-epic-dialog/create-epic-dialog.component';

@Component({
  selector: 'app-epic',
  templateUrl: './epic.component.html',
  styleUrls: ['./epic.component.scss']
})
export class EpicComponent implements OnInit, OnDestroy {
  selectedEpic: Epic;
  epics: Epic[];
  menuTitle = 'Epics';

  private epicSubscription: Subscription;

  constructor(private epicService: EpicsService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.epicSubscription = this.epicService.epicItems.subscribe(
      (epics: Epic[]) => (this.epics = epics)
    );
  }

  ngOnDestroy(): void {
    if (this.epicSubscription) {
      this.epicSubscription.unsubscribe();
    }
  }

  createEpic(): void {
    // TODO: open a dialog that allows the user to enter the title of the epic
    const dialogRef = this.dialog.open(CreateEpicDialogComponent, {
      width: '400px',
      data: ''
    });

    dialogRef.afterClosed().subscribe((title) => {
      this.epicService.addEpic(title);
    });
  }

  openEpic(epic: Epic): void {
    this.selectedEpic = epic;
    this.menuTitle = epic.title;
  }
}
