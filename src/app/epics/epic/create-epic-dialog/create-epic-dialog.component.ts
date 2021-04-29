import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-create-epic-dialog',
  templateUrl: './create-epic-dialog.component.html',
  styleUrls: ['./create-epic-dialog.component.scss']
})
export class CreateEpicDialogComponent {

  constructor(private dialogRef: MatDialogRef<CreateEpicDialogComponent>, @Inject(MAT_DIALOG_DATA) public title: string) { }

  onCancel(): void {
    this.dialogRef.close();
  }
}
