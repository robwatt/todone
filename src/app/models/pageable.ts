import { Filter } from './filter';

export interface Pageable {
    page: number;
    pageSize: number;
    filters: Filter[];
}