import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { Filter } from 'src/app/models/filter';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnChanges {
  @Input() filtersToApply: Filter[];
  @Output() appliedFilters = new EventEmitter<Filter[]>();

  availableFilters: Filter[] = [];
  filterList: Filter[] = [];

  constructor() {
    this.availableFilters = [
      {
        displayName: 'Ongoing',
        dbField: 'complete',
        dbOperation: '==',
        dbValue: false
      },
      {
        displayName: 'Completed',
        dbField: 'complete',
        dbOperation: '==',
        dbValue: true
      }
    ];
  }

  ngOnChanges(): void {
    if (this.filtersToApply) {
      this.filterList = this.filtersToApply;
    }
  }

  /**
   * Adds the specific filter to the list, if it isn't already in the filter list.
   * @param filter Filter to add
   */
  applyFilter(filter: Filter): void {
    if (this.filterList.indexOf(filter) === -1) {
      this.filterList.push(filter);
      this.appliedFilters.emit(this.filterList.slice());
    }
  }

  /**
   * Removes the specific filter from the list, if it is already in the list.
   * @param filter Filter to remove
   */
  removeFilter(filter: Filter): void {
    const index = this.filterList.indexOf(filter);
    if (index > -1) {
      this.filterList.splice(index, 1);
      this.appliedFilters.emit(this.filterList.slice());
    }
  }
}
