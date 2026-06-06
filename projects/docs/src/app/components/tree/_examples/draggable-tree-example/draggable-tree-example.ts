import { Component } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';
import {
  Tree,
  TreeNode,
  TreeNodeDef,
  TreeNodeDrop,
  TreeNodePadding,
  TreeNodeToggle
} from '@ngstarter-ui/components/tree';

interface ProjectNode {
  name: string;
  children?: ProjectNode[];
}

const EXAMPLE_DATA: ProjectNode[] = [
  {
    name: 'Workspace',
    children: [
      {
        name: 'Design',
        children: [
          { name: 'Tokens' },
          { name: 'Components' },
        ],
      },
      { name: 'Docs' },
    ],
  },
  {
    name: 'Product',
    children: [
      { name: 'Roadmap' },
      { name: 'Research' },
    ],
  },
  { name: 'Archive' },
];

@Component({
  selector: 'app-draggable-tree-example',
  imports: [
    Button,
    Icon,
    Tree,
    TreeNode,
    TreeNodeDef,
    TreeNodePadding,
    TreeNodeToggle,
  ],
  templateUrl: './draggable-tree-example.html',
  styleUrl: './draggable-tree-example.scss',
})
export class DraggableTreeExample {
  dataSource = EXAMPLE_DATA;
  dropMessage = 'Move a node into another node or reorder it around a node';
  childrenAccessor = (node: ProjectNode) => node.children ?? [];
  hasChild = (_: number, node: ProjectNode) => !!node.children && node.children.length > 0;
  trackByName = (_: number, node: ProjectNode) => node.name;

  onNodeDrop(event: TreeNodeDrop<ProjectNode>) {
    const action = event.position === 'inside'
      ? 'moved into'
      : event.position === 'before'
        ? 'moved before'
        : 'moved after';

    this.dropMessage = `${event.source.name} ${action} ${event.target.name}`;
  }
}
