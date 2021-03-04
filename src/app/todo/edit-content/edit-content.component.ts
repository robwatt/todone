import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EditDialogData } from 'src/app/task/task.component';

@Component({
  selector: 'app-edit-content',
  templateUrl: './edit-content.component.html',
  styleUrls: ['./edit-content.component.scss']
})
export class EditContentComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<EditContentComponent>, @Inject(MAT_DIALOG_DATA) public data: EditDialogData) { }

  ngOnInit(): void {
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
