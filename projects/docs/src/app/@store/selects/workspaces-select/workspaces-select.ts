import { Component, effect, input, output, signal } from '@angular/core';
import { Menu, MenuTrigger } from '@ngstarter/components/menu';
import { Icon } from '@ngstarter/components/icon';
import { Dicebear } from '@ngstarter/components/avatar';
import { Divider } from '@ngstarter/components/divider';
import { Button } from '@ngstarter/components/button';
import { Ripple } from '@ngstarter/components/core';

@Component({
  selector: 'app-workspaces-select',
  imports: [
    Menu,
    MenuTrigger,
    Icon,
    Dicebear,
    Divider,
    Button,
    Ripple,
  ],
  templateUrl: './workspaces-select.html',
  styleUrl: './workspaces-select.scss'
})
export class WorkspacesSelect {
  workspaces = input<any[]>([]);
  selectedWorkspace = input();
  protected _selectedWorkspace = signal<any>(null);

  readonly workspaceSelected = output<any>();

  constructor() {
    effect(() => {
      this._selectedWorkspace.set(this.selectedWorkspace());
    });
  }

  selectWorkspace(workspace: any) {
    if (this._selectedWorkspace()?.id === workspace.id) {
      return;
    }

    this._selectedWorkspace.set(workspace);
    this.workspaceSelected.emit(workspace);
  }
}
