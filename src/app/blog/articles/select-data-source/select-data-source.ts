import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from '@ngstarter-ui/components/button';
import { Card, CardContent } from '@ngstarter-ui/components/card';
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
  selector: 'app-select-data-source',
  imports: [
    Button,
    Card,
    CardContent,
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
  templateUrl: './select-data-source.html',
  styleUrl: './select-data-source.scss',
})
export class SelectDataSourceArticle {
  readonly dataSourceCode = `import { SelectDataSource, SelectDataSourceOption } from '@ngstarter-ui/components/select';

interface UserOption {
  id: string;
  name: string;
  team: string;
}

const usersDataSource: SelectDataSource<UserOption> = async request => {
  const response = await usersApi.search({
    search: request.search,
    page: request.page,
    pageSize: request.pageSize,
    selectedValues: request.selectedValues,
    signal: request.signal,
  });

  const selected = request.reason === 'initial'
    ? await usersApi.findByIds(request.selectedValues)
    : [];

  return {
    items: toOptions([...selected, ...response.items]),
    hasMore: response.hasMore,
    nextCursor: response.nextPage,
  };
};

function toOptions(users: UserOption[]): SelectDataSourceOption<UserOption>[] {
  const seen = new Set<string>();

  return users
    .filter(user => {
      if (seen.has(user.id)) {
        return false;
      }

      seen.add(user.id);
      return true;
    })
    .map(user => ({
      label: \`\${user.name} - \${user.team}\`,
      value: user.id,
      data: user,
    }));
}`;

  readonly selectTemplateCode = `<ngs-form-field>
  <ngs-label>Owner</ngs-label>
  <ngs-select
    [formControl]="owner"
    [dataSource]="usersDataSource"
    [pageSize]="20"
    searchable
    [minSearchLength]="1">
    <ng-template ngsOptionContentDef let-user let-label="label">
      <strong>{{ user?.name || label }}</strong>
      <span>{{ user?.team }}</span>
    </ng-template>

    <ng-template ngsSelectValueDef let-user let-label="label">
      {{ user?.name || label }}
    </ng-template>
  </ngs-select>
</ngs-form-field>`;

  readonly formBuilderProviderCode = `import {
  provideFormBuilderSelectDataSource,
} from '@ngstarter-ui/components/form-builder';

@Component({
  providers: [
    provideFormBuilderSelectDataSource({
      id: 'users',
      name: 'Users',
      dataSource: usersDataSource,
      optionContentComponent: UserOptionComponent,
      valueComponent: UserValueComponent,
    }),
  ],
})
export class FormBuilderScreen {}`;

  readonly formBuilderSchemaCode = `const schema: FormBuilderSchema = {
  sections: [
    {
      id: 'assignment',
      title: 'Assignment',
      fields: [
        {
          id: 'owner',
          name: 'owner',
          type: 'select',
          label: 'Owner',
          optionsSource: 'dataSource',
          dataSource: 'users',
        },
      ],
    },
  ],
};`;

  readonly componentTemplateCode = `@Component({
  selector: 'app-user-option',
  template: \`
    <div class="flex flex-col">
      <strong>{{ data?.name || label }}</strong>
      <span>{{ data?.team }}</span>
    </div>
  \`,
})
export class UserOptionComponent {
  readonly data = input<UserOption | null>(null);
  readonly label = input('');
}`;
}
