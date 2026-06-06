import { Component } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';
import { Tree, TreeNode, TreeNodeDef, TreeNodePadding, TreeNodeToggle } from '@ngstarter-ui/components/tree';

interface FileNode {
  name: string;
  disabled?: boolean;
  children?: FileNode[];
}

const EXAMPLE_DATA: FileNode[] = [
  {
    name: 'Design system',
    children: [
      { name: 'Tokens' },
      { name: 'Components' },
      { name: 'Patterns' },
    ],
  },
  {
    name: 'Product',
    children: [
      { name: 'Roadmap' },
      { name: 'Research' },
      { name: 'Releases', disabled: true },
    ],
  },
];

@Component({
  selector: 'app-selectable-tree-example',
  imports: [
    Button,
    Icon,
    Tree,
    TreeNode,
    TreeNodeDef,
    TreeNodePadding,
    TreeNodeToggle,
  ],
  templateUrl: './selectable-tree-example.html',
  styleUrl: './selectable-tree-example.scss',
})
export class SelectableTreeExample {
  dataSource = EXAMPLE_DATA;
  selectedValue: unknown;
  childrenAccessor = (node: FileNode) => node.children ?? [];
  hasChild = (_: number, node: FileNode) => !!node.children && node.children.length > 0;
  trackByName = (_: number, node: FileNode) => node.name;
}
