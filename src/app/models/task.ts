import firebase from 'firebase/app';

export interface Task {
  id?: string;
  name: string;
  date: firebase.firestore.Timestamp;
  subtask?: Task[];
  complete: boolean;
  subtaskCount?: number;
  description?: string;
}
