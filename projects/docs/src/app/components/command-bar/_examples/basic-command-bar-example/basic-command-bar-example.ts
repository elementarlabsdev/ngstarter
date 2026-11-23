import { toObservable } from '@angular/core/rxjs-interop';
import { Component, DestroyRef, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { Checkbox } from '@ngstarter-ui/components/checkbox';
import { FormsModule } from '@angular/forms';
import { FormField as SignalFormField, form } from '@angular/forms/signals';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Option, Select } from '@ngstarter-ui/components/select';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  CommandBarCommand,
  CommandBar,
  CommandBarDivider,
  CommandBarPosition
} from '@ngstarter-ui/components/command-bar';

@Component({
  selector: 'app-basic-command-bar-example',
  imports: [
    Checkbox,
    FormsModule,
    FormField,
    Label,
    Option,
    Select,
    SignalFormField,
    CommandBarDivider,
    CommandBar,
    CommandBarCommand
  ],
  templateUrl: './basic-command-bar-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './basic-command-bar-example.scss'
})
export class BasicCommandBarExample implements OnInit {
  private _destroyRef = inject(DestroyRef);
  open = false;
  positionOptions: CommandBarPosition[] = ['top', 'bottom'];
  position = form(signal<CommandBarPosition>('bottom'));
  private readonly positionChanges = toObservable(this.position().value);

  ngOnInit() {
    this.positionChanges
      .pipe(
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe(() => {
        this.open = false;
      })
    ;
  }
}
