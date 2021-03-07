import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {

  filterList: string[] = [];

  constructor() { }

  ngOnInit(): void {
  }

  /**
   * Adds the specific filter to the list, if it isn't already in the filter list.
   * @param filter Filter to add
   */
  applyFilter(filter: string): void {
    if (this.filterList.indexOf(filter) === -1) {
      this.filterList.push(filter);
    }
  }

  /**
   * Removes the specific filter from the list, if it is already in the list.
   * @param filter Filter to remove
   */
  filterRemoved(filter: string): void {
    const index = this.filterList.indexOf(filter);
    if (index > -1) {
      this.filterList.splice(index, 1);
    }
  }
}
