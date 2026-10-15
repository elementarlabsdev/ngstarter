import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TreeSelect, TreeSelectKey, TreeSelectNode } from '@ngstarter-ui/components/tree-select';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
@Component({
  selector: 'app-multiple-tree-select-example',
  imports: [TreeSelect, FormField, Label, FormsModule],
  templateUrl: './multiple-tree-select-example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultipleTreeSelectExample {
  readonly selected = signal<TreeSelectKey[]>(['read']);
  readonly nodes: TreeSelectNode[] = [
    {
      value: 'permissions',
      label: 'Permissions',
      children: [
        { value: 'read', label: 'Read' },
        { value: 'write', label: 'Write' },
        { value: 'delete', label: 'Delete', disabled: true },
      ],
    },
  ];
}
