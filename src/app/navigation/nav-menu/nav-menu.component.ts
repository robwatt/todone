import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, OnInit } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';

interface MenuNode {
  name: string;
  route?: string;
  icon?: string;
  canCreate?: boolean;
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
    route: '/dashboard/epics'
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

  selectedParent: MenuNode = null;
  newItemName = '';
  private data: MenuNode[];

  constructor() {
    this.data = TREE_DATA;
    this.dataSource.data = this.data;
  }

  ngOnInit(): void {
    // default to opening the Todo tree node
    const referenceToNode = TREE_DATA.filter((item) => item.name === 'Todo');
    this.treeControl.expand(referenceToNode[0]);
  }

  hasChild = (_: number, node: MenuNode) =>
    !!node.children && node.children.length > 0;

  hasNoContent = (_: number, _nodeData: MenuNode) => _nodeData.name === '';

  /** Select the category so we can insert the new item. */
  addNewItem(node: MenuNode): void {
    console.log('node', node);
    const newNode = {
      name: '',
      route: '',
      icon: ''
    };
    node.children.push(newNode);
    // workaround: If you just update the data, the tree will not render the new node
    // the workaround is to null the datasource data, then assign it back.
    this.dataSource.data = null;
    this.dataSource.data = this.data;

    console.log('new dataSource', this.dataSource.data);
    // const parentNode = this.flatNodeMap.get(node);
    // this._database.insertItem(parentNode!, '');
    this.treeControl.expand(node);
  }

  saveNode(node: MenuNode, itemValue: string): void {
    // add to the selected node, this new value
    console.log('save node', node, itemValue);
  }
}
