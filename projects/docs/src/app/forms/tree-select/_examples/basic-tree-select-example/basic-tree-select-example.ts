import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TreeSelect, TreeSelectNode } from '@ngstarter-ui/components/tree-select';
import { Error, FormField, Label } from '@ngstarter-ui/components/form-field';
@Component({
  selector: 'app-basic-tree-select-example',
  imports: [TreeSelect, FormField, Label, Error, ReactiveFormsModule],
  templateUrl: './basic-tree-select-example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasicTreeSelectExample {
  readonly department = new FormControl<string | null>(null, Validators.required);
  readonly nodes: TreeSelectNode[] = [
    {
      value: 'engineering',
      label: 'Engineering',
      children: [
        { value: 'frontend', label: 'Frontend' },
        { value: 'backend', label: 'Backend' },
      ],
    },
    {
      value: 'operations',
      label: 'Operations',
      children: [
        { value: 'support', label: 'Support' },
        { value: 'finance', label: 'Finance', disabled: true },
      ],
    },
  ];
}
