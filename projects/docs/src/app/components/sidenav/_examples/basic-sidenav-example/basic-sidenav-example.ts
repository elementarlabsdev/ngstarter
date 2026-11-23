import { Component, viewChild, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormField as SignalFormField, form } from '@angular/forms/signals';
import { Sidenav, SidenavContainer, SidenavContent } from '@ngstarter-ui/components/sidenav';
import { Button } from '@ngstarter-ui/components/button';
import { RadioButton, RadioGroup } from '@ngstarter-ui/components/radio';

@Component({
  selector: 'app-basic-sidenav-example',
  imports: [
    SignalFormField,
    SidenavContainer,
    Sidenav,
    Button,
    SidenavContent,
    RadioGroup,
    RadioButton
  ],
  templateUrl: './basic-sidenav-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './basic-sidenav-example.scss'
})
export class BasicSidenavExample {
  readonly sidenav = viewChild.required(Sidenav);

  reason = '';
  mode = form(signal<'push' | 'over' | 'side'>('push'));

  async close(reason: string) {
    this.reason = reason;
    await this.sidenav().close();
  }
}
