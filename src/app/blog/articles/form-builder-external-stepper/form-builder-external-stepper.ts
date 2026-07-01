import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from '@ngstarter-ui/components/button';
import { Chip, ChipSet } from '@ngstarter-ui/components/chips';
import { CodeHighlighter } from '@ngstarter-ui/components/code-highlighter';
import { Icon } from '@ngstarter-ui/components/icon';
import {
  ScrollSpyBackToTop,
  ScrollSpyNav,
  ScrollSpyOn,
  ScrollSpyTitle,
} from '@ngstarter-ui/components/scroll-spy';

@Component({
  selector: 'app-form-builder-external-stepper',
  imports: [
    Button,
    Chip,
    ChipSet,
    CodeHighlighter,
    Icon,
    RouterLink,
    ScrollSpyBackToTop,
    ScrollSpyNav,
    ScrollSpyOn,
    ScrollSpyTitle,
  ],
  templateUrl: './form-builder-external-stepper.html',
  styleUrl: './form-builder-external-stepper.scss',
})
export class FormBuilderExternalStepperArticle {
  readonly rendererFlowCode = `const runtimeFlow: FormBuilderFlow = {
  mode: 'steps',
  steps: [
    {
      id: 'client',
      title: 'Client',
      items: [
        { kind: 'section', id: 'client' },
      ],
    },
    {
      id: 'invoice',
      title: 'Invoice',
      items: [
        { kind: 'section', id: 'items' },
        { kind: 'field', id: 'invoice_total' },
      ],
    },
  ],
};`;

  readonly rendererFlowTemplateCode = `<ngs-form-renderer
  [schema]="schema"
  [flow]="runtimeFlow"
  [(value)]="value"
  (formSubmit)="save($event)" />`;

  readonly externalStepperCode = `<ngs-stepper>
  @for (step of steps; track step.id) {
    <ngs-step [label]="step.title">
      <ngs-form-renderer
        [schema]="schema"
        [items]="step.items"
        [showSubmit]="false" />
    </ngs-step>
  }
</ngs-stepper>`;

  readonly separateFormsCode = `<ngs-stepper>
  <ngs-step label="Client">
    <ngs-form-renderer [schema]="clientSchema" />
  </ngs-step>

  <ngs-step label="Invoice">
    <ngs-form-renderer [schema]="invoiceSchema" />
  </ngs-step>
</ngs-stepper>`;

  readonly oneFormCode = `<form [formGroup]="form" (ngSubmit)="submit()">
  <ngs-stepper>
    @for (step of steps; track step.id) {
      <ngs-step [label]="step.title">
        <ngs-form-renderer
          [schema]="schema"
          [items]="step.items"
          [formGroup]="form"
          [showSubmit]="false" />
      </ngs-step>
    }
  </ngs-stepper>

  <button ngsButton="filled" type="submit">Submit</button>
</form>`;

  readonly futureInputsCode = `readonly items = input<FormBuilderLayoutItem[] | null>(null);
readonly formGroup = input<FormGroup | null>(null);

protected readonly activeItems = computed(() =>
  this.items() ?? normalizedLayout(this.schema())
);

protected readonly form = computed(() =>
  this.formGroup() ?? this.createFormGroup()
);`;

  readonly decisionCode = `// Use this when the renderer owns navigation.
<ngs-form-renderer [schema]="schema" [flow]="flow" />

// Use this only when renderer supports shared formGroup + items.
<ngs-stepper>
  <ngs-step>
    <ngs-form-renderer [schema]="schema" [items]="items" [formGroup]="form" />
  </ngs-step>
</ngs-stepper>`;
}
