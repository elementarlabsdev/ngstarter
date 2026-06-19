import { Component, signal } from '@angular/core';
import {
  FormBuilder,
  FormBuilderSchema,
  provideFormBuilderSelectDataSource
} from '@ngstarter-ui/components/form-builder';
import { SelectDataSource, SelectDataSourceOption } from '@ngstarter-ui/components/select';

interface OwnerOption {
  id: string;
  name: string;
  team: string;
}

const OWNER_OPTIONS: OwnerOption[] = [
  { id: 'owner-1', name: 'Ada Lovelace', team: 'Platform' },
  { id: 'owner-2', name: 'Grace Hopper', team: 'Infrastructure' },
  { id: 'owner-3', name: 'Alan Turing', team: 'Research' },
  { id: 'owner-4', name: 'Katherine Johnson', team: 'Analytics' },
  { id: 'owner-5', name: 'Margaret Hamilton', team: 'Reliability' }
];

const ownersDataSource: SelectDataSource<OwnerOption> = async request => {
  const query = request.search.trim().toLowerCase();
  const selected = request.reason === 'initial'
    ? OWNER_OPTIONS.filter(owner => request.selectedValues.includes(owner.id))
    : [];
  const filtered = OWNER_OPTIONS.filter(owner =>
    !query ||
    owner.name.toLowerCase().includes(query) ||
    owner.team.toLowerCase().includes(query)
  );
  const start = (request.page - 1) * request.pageSize;
  const page = filtered.slice(start, start + request.pageSize);

  return {
    items: toOwnerOptions([...selected, ...page]),
    hasMore: start + request.pageSize < filtered.length,
    nextCursor: request.page + 1
  };
};

function toOwnerOptions(owners: OwnerOption[]): SelectDataSourceOption<OwnerOption>[] {
  const seen = new Set<string>();

  return owners
    .filter(owner => {
      if (seen.has(owner.id)) {
        return false;
      }

      seen.add(owner.id);
      return true;
    })
    .map(owner => ({
      label: `${owner.name} - ${owner.team}`,
      value: owner.id,
      data: owner
    }));
}

@Component({
  imports: [
    FormBuilder
  ],
  providers: [
    provideFormBuilderSelectDataSource({
      id: 'owners',
      name: 'Owners',
      dataSource: ownersDataSource
    })
  ],
  templateUrl: './examples.html',
  styleUrl: './examples.scss'
})
export class Examples {
  schema = signal<FormBuilderSchema>({
    title: 'Invoice form',
    sections: [
      {
        id: 'invoice',
        title: 'Invoice details',
        fields: [
          {
            id: 'invoice_number',
            name: 'invoice_number',
            type: 'text',
            label: 'Invoice number',
            placeholder: 'INV-2026-001',
            required: true,
            width: 4
          },
          {
            id: 'invoice_date',
            name: 'invoice_date',
            type: 'date',
            label: 'Invoice date',
            required: true,
            width: 4
          },
          {
            id: 'due_date',
            name: 'due_date',
            type: 'date',
            label: 'Due date',
            required: true,
            width: 4
          }
        ]
      },
      {
        id: 'client',
        title: 'Client',
        fields: [
          {
            id: 'client_name',
            name: 'client_name',
            type: 'text',
            label: 'Client',
            placeholder: 'Acme LLC',
            width: 6
          },
          {
            id: 'client_email',
            name: 'client_email',
            type: 'email',
            label: 'Email',
            placeholder: 'billing@acme.test',
            width: 6
          }
        ]
      },
      {
        id: 'services',
        title: 'Services',
        fields: [
          {
            id: 'invoice_items',
            name: 'invoice_items',
            type: 'group',
            label: 'Invoice items',
            width: 12,
            children: [
              {
                id: 'item_description',
                name: 'item_description',
                type: 'textarea',
                label: 'Description',
                placeholder: 'Service description',
                width: 12
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
                width: 3
              }
            ]
          }
        ]
      }
    ]
  });
}
