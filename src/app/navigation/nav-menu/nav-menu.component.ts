import { FlatTreeControl, NestedTreeControl } from '@angular/cdk/tree';
import { Component, OnInit } from '@angular/core';
import {
  MatTreeFlatDataSource,
  MatTreeNestedDataSource
} from '@angular/material/tree';

interface MenuNode {
  name: string;
  route?: string;
  icon?: string;
  children?: MenuNode[];
}

const TREE_DATA: MenuNode[] = [
  {
    name: 'Todo',
    children: [
      { name: 'Personal', route: '/dashboard/todo-personal', icon: 'task_alt' },
      { name: 'Work', route: '/dashboard/todo', icon: 'task_alt' }
    ]
  },
  {
    name: 'Epics',
    children: [{ name: 'Stories', icon: 'book' }]
  },
  {
    name: 'Retrospectives',
    children: [{ name: 'Retrospectives', icon: 'manage_accounts' }]
  }
];

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.scss']
})
export class NavMenuComponent implements OnInit {
  treeControl = new NestedTreeControl<MenuNode>((node) => node.children);
  dataSource = new MatTreeNestedDataSource<MenuNode>();

  constructor() {
    this.dataSource.data = TREE_DATA;
  }

  ngOnInit(): void {}

  hasChild = (_: number, node: MenuNode) =>
    !!node.children && node.children.length > 0;
}
