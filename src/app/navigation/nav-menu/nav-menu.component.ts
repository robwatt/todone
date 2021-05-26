import { Component } from '@angular/core';

interface MenuNode {
  name: string;
  route?: string;
  icon?: string;
}

const TODO_DATA: MenuNode[] = [
  {
    name: 'Personal',
    route: '/dashboard/todo-personal',
    icon: 'task_alt'
  },
  {
    name: 'Work',
    route: '/dashboard/todo',
    icon: 'task_alt'
  }
];

const EPIC_DATA: MenuNode[] = [
  {
    name: 'Epics',
    icon: 'bolt',
    route: '/dashboard/epics'
  }
];

const NOTES_DATA: MenuNode[] = [
  {
    name: 'Notes',
    icon: 'note_alt',
    route: '/dashboard/notes'
  }
];

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.scss']
})
export class NavMenuComponent {
  todoData: MenuNode[];
  epicsData: MenuNode[];
  notesData: MenuNode[];

  constructor() {
    this.todoData = TODO_DATA;
    this.epicsData = EPIC_DATA;
    this.notesData = NOTES_DATA;
  }
}
