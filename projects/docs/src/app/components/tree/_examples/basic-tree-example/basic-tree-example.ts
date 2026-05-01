import { Component } from '@angular/core';
import { Icon } from '@ngstarter/components/icon';
import { Button } from '@ngstarter/components/button';
import { Tree, TreeNode, TreeNodeDef, TreeNodePadding, TreeNodeToggle } from '@ngstarter/components/tree';

interface FoodNode {
  name: string;
  children?: FoodNode[];
}

const EXAMPLE_DATA: FoodNode[] = [
  {
    name: 'Fruit',
    children: [{name: 'Apple'}, {name: 'Banana'}, {name: 'Fruit loops'}],
  },
  {
    name: 'Vegetables',
    children: [
      {
        name: 'Green',
        children: [{name: 'Broccoli'}, {name: 'Brussels sprouts'}],
      },
      {
        name: 'Orange',
        children: [{name: 'Pumpkins'}, {name: 'Carrots'}],
      },
    ],
  },
];

@Component({
  selector: 'app-basic-tree-example',
  imports: [
    Icon,
    Button,
    TreeNode,
    TreeNodeDef,
    TreeNodePadding,
    Tree,
    TreeNodeToggle
  ],
  templateUrl: './basic-tree-example.html',
  styleUrl: './basic-tree-example.scss'
})
export class BasicTreeExample {
  dataSource = EXAMPLE_DATA;
  childrenAccessor = (node: FoodNode) => node.children ?? [];
  hasChild = (_: number, node: FoodNode) => !!node.children && node.children.length > 0;
}
