import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { Checkbox } from '@ngstarter/components/checkbox';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormField, Label } from '@ngstarter/components/form-field';
import { Option, Select } from '@ngstarter/components/select';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  CommandBarCommand,
  CommandBar,
  CommandBarDivider,
  CommandBarPosition
} from '@ngstarter/components/command-bar';

@Component({
  selector: 'app-basic-command-bar-example',
  imports: [
    Checkbox,
    FormsModule,
    FormField,
    Label,
    Option,
    Select,
    ReactiveFormsModule,
    CommandBarDivider,
    CommandBar,
    CommandBarCommand
  ],
  templateUrl: './basic-command-bar-example.html',
  styleUrl: './basic-command-bar-example.scss'
})
export class BasicCommandBarExample implements OnInit {
  private _destroyRef = inject(DestroyRef);
  open = false;
  positionOptions: CommandBarPosition[] = ['top', 'bottom'];
  position = new FormControl<CommandBarPosition>('bottom');

  ngOnInit() {
    this.position
      .valueChanges
      .pipe(
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe(() => {
        this.open = false;
      })
    ;
  }
}
