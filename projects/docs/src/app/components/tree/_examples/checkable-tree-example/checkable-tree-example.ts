import { Component } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';
import { Tree, TreeNode, TreeNodeDef, TreeNodePadding, TreeNodeToggle } from '@ngstarter-ui/components/tree';

interface PermissionNode {
  name: string;
  disabled?: boolean;
  children?: PermissionNode[];
}

const EXAMPLE_DATA: PermissionNode[] = [
  {
    name: 'Workspace',
    children: [
      { name: 'Read projects' },
      { name: 'Create projects' },
      { name: 'Archive projects', disabled: true },
    ],
  },
  {
    name: 'Team',
    children: [
      {
        name: 'Members',
        children: [
          { name: 'Invite members' },
          { name: 'Remove members' },
        ],
      },
      {
        name: 'Billing',
        children: [
          { name: 'View invoices' },
          { name: 'Manage payment methods' },
        ],
      },
    ],
  },
];

@Component({
  selector: 'app-checkable-tree-example',
  imports: [
    Button,
    Icon,
    TreeNode,
    TreeNodeDef,
    TreeNodePadding,
    Tree,
    TreeNodeToggle,
  ],
  templateUrl: './checkable-tree-example.html',
  styleUrl: './checkable-tree-example.scss',
})
export class CheckableTreeExample {
  dataSource = EXAMPLE_DATA;
  checkedValues: unknown[] = [];
  childrenAccessor = (node: PermissionNode) => node.children ?? [];
  hasChild = (_: number, node: PermissionNode) => !!node.children && node.children.length > 0;
  trackByName = (_: number, node: PermissionNode) => node.name;
}
