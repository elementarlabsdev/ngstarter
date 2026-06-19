import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import {
  Select,
  SelectDataSource,
  SelectDataSourceOption,
  SelectOptionContentDef,
  SelectValueDef
} from '@ngstarter-ui/components/select';
import { USER_OPTIONS, UserOption } from './async-data-source-select-example-data';

@Component({
  selector: 'app-async-data-source-select-example',
  imports: [
    ReactiveFormsModule,
    FormField,
    Label,
    Select,
    SelectOptionContentDef,
    SelectValueDef
  ],
  templateUrl: './async-data-source-select-example.html',
  styleUrl: './async-data-source-select-example.scss'
})
export class AsyncDataSourceSelectExample {
  readonly owner = new FormControl<string | null>(null);
  private readonly loadDelay = 800;
  private readonly users = USER_OPTIONS;

  readonly usersDataSource: SelectDataSource<UserOption> = async request => {
    await this.delay(this.loadDelay);

    const query = request.search.trim().toLowerCase();
    const filtered = this.users.filter(user =>
      !query ||
      user.name.toLowerCase().includes(query) ||
      user.team.toLowerCase().includes(query)
    );
    const start = (request.page - 1) * request.pageSize;
    const page = filtered.slice(start, start + request.pageSize);
    const selected = request.reason === 'initial'
      ? this.users.filter(user => request.selectedValues.includes(user.id))
      : [];
    const items = this.toOptions([...selected, ...page]);

    return {
      items,
      hasMore: start + request.pageSize < filtered.length,
      nextCursor: request.page + 1
    };
  };

  private toOptions(users: UserOption[]): SelectDataSourceOption<UserOption>[] {
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
        label: `${user.name} - ${user.team}`,
        value: user.id,
        data: user
      }));
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
