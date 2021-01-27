import { DateTime } from 'luxon';

export interface Task {
  id: string;
  name: string;
  date: DateTime;
  subtask?: Task[];
}
