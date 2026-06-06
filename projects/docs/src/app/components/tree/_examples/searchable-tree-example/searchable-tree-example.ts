import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from '@ngstarter-ui/components/button';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Icon } from '@ngstarter-ui/components/icon';
import { Input } from '@ngstarter-ui/components/input';
import { Tree, TreeFilterPredicate, TreeNode, TreeNodeDef, TreeNodePadding, TreeNodeToggle } from '@ngstarter-ui/components/tree';

interface FoodNode {
  name: string;
  children?: FoodNode[];
}

const EXAMPLE_DATA: FoodNode[] = [
  {
    name: 'Fruit',
    children: [
      { name: 'Apple' },
      { name: 'Banana' },
      { name: 'Fruit loops' },
    ],
  },
  {
    name: 'Vegetables',
    children: [
      {
        name: 'Green',
        children: [
          { name: 'Broccoli' },
          { name: 'Brussels sprouts' },
        ],
      },
      {
        name: 'Orange',
        children: [
          { name: 'Pumpkins' },
          { name: 'Carrots' },
        ],
      },
    ],
  },
];

@Component({
  selector: 'app-searchable-tree-example',
  imports: [
    Button,
    FormField,
    FormsModule,
    Icon,
    Input,
    Label,
    Tree,
    TreeNode,
    TreeNodeDef,
    TreeNodePadding,
    TreeNodeToggle,
  ],
  templateUrl: './searchable-tree-example.html',
  styleUrl: './searchable-tree-example.scss',
})
export class SearchableTreeExample {
  dataSource = EXAMPLE_DATA;
  search = '';
  childrenAccessor = (node: FoodNode) => node.children ?? [];
  hasChild = (_: number, node: FoodNode) => !!node.children && node.children.length > 0;
  filterPredicate: TreeFilterPredicate<FoodNode> = (node, value) => (
    node.name.toLowerCase().includes(value.toLowerCase())
  );
}
