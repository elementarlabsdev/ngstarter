import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormField as SignalFormField, form, required } from '@angular/forms/signals';
import { TreeSelect, TreeSelectNode } from '@ngstarter-ui/components/tree-select';
import { Error, FormField, Label } from '@ngstarter-ui/components/form-field';
@Component({
  selector: 'app-basic-tree-select-example',
  imports: [TreeSelect, FormField, Label, Error, SignalFormField],
  templateUrl: './basic-tree-select-example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasicTreeSelectExample {
  readonly department = form(signal<string | null>(null), path => {
    required(path);
  });
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
