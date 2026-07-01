import { JsonPipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { Card, CardContent, CardHeader, CardTitle } from '@ngstarter-ui/components/card';
import { FormBuilderFlow, FormBuilderSchema, FormRenderer } from '@ngstarter-ui/components/form-builder';
import { Button } from '@ngstarter-ui/components/button';
import { Step, Stepper } from '@ngstarter-ui/components/stepper';

function createRendererFlowFromSchema(schema: FormBuilderSchema): FormBuilderFlow {
  const flow = schema.flow;

  if (flow?.mode !== 'steps' || !flow.steps?.length) {
    return { mode: 'single' };
  }

  return {
    mode: 'steps',
    steps: flow.steps.map(step => ({
      id: step.id,
      title: step.title,
      description: step.description,
      optional: step.optional,
      items: step.items.map(item => ({
        kind: item.kind,
        id: item.id
      }))
    }))
  };
}

@Component({
  selector: 'app-external-renderer-flow-example',
  imports: [
    JsonPipe,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    FormRenderer,
    Step,
    Stepper
  ],
  templateUrl: './external-renderer-flow-example.html',
  styleUrl: './external-renderer-flow-example.scss'
})
export class ExternalRendererFlowExample {
  readonly value = signal<Record<string, any>>({
    client_name: 'Northwind Traders',
    client_email: 'billing@northwind.example',
    item_description: 'Support package',
    item_quantity: 4,
    item_price: 75
  });
  readonly submittedValue = signal<Record<string, any> | null>(null);
  readonly selectedStepIndex = signal(0);

  readonly schema: FormBuilderSchema = {
    title: 'Runtime invoice',
    fields: [
      {
        id: 'invoice_total',
        name: 'invoice_total',
        type: 'calculated',
        label: 'Invoice total',
        width: 6,
        settings: {
          expression: 'ROUND(item_quantity * item_price, 2)',
          valueType: 'number',
          precision: 2
        }
      }
    ],
    layout: [
      { kind: 'section', id: 'client' },
      { kind: 'section', id: 'items' },
      { kind: 'field', id: 'invoice_total' }
    ],
    flow: {
      mode: 'steps',
      steps: [
        {
          id: 'client-step',
          title: 'Client',
          items: [
            { kind: 'section', id: 'client' }
          ]
        },
        {
          id: 'invoice-step',
          title: 'Invoice',
          items: [
            { kind: 'section', id: 'items' },
            { kind: 'field', id: 'invoice_total' }
          ]
        }
      ]
    },
    sections: [
      {
        id: 'client',
        title: 'Client',
        fields: [
          {
            id: 'client_name',
            name: 'client_name',
            type: 'text',
            label: 'Client name',
            width: 6,
            required: true
          },
          {
            id: 'client_email',
            name: 'client_email',
            type: 'email',
            label: 'Client email',
            width: 6,
            required: true
          }
        ]
      },
      {
        id: 'items',
        title: 'Invoice items',
        fields: [
          {
            id: 'item_description',
            name: 'item_description',
            type: 'text',
            label: 'Description',
            width: 6
          },
          {
            id: 'item_quantity',
            name: 'item_quantity',
            type: 'number',
            label: 'Quantity',
            width: 3,
            defaultValue: 1
          },
          {
            id: 'item_price',
            name: 'item_price',
            type: 'currency',
            label: 'Price',
            width: 3,
            defaultValue: 0
          }
        ]
      }
    ]
  };

  readonly runtimeFlow = createRendererFlowFromSchema(this.schema);
  readonly runtimeSteps = this.runtimeFlow.mode === 'steps'
    ? this.runtimeFlow.steps ?? []
    : [];
  readonly activeStepItems = computed(() =>
    this.runtimeSteps[this.selectedStepIndex()]?.items ?? []
  );
}
