/**
 * This interface provides content back to the component about the page being requested.
 * It provides the paged data, and whether or not there is a next or previous page.
 */
export interface Page<T> {
  data: T[];
  total: number;
}