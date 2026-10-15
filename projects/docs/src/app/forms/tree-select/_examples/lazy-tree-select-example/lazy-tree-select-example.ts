import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  TreeSelect,
  TreeSelectChildrenLoader,
  TreeSelectNode,
} from '@ngstarter-ui/components/tree-select';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
@Component({
  selector: 'app-lazy-tree-select-example',
  imports: [TreeSelect, FormField, Label, FormsModule],
  templateUrl: './lazy-tree-select-example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LazyTreeSelectExample {
  readonly selected = signal<string | null>(null);
  readonly nodes: TreeSelectNode[] = [
    { value: 'documents', label: 'Documents', hasChildren: true },
  ];
  readonly loadChildren: TreeSelectChildrenLoader = async (node) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return [
      { value: node.value + '-reports', label: 'Reports' },
      { value: node.value + '-invoices', label: 'Invoices' },
    ];
  };
}
