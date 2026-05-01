import { Component, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Sidenav, SidenavContainer, SidenavContent } from '@ngstarter/components/sidenav';
import { Button } from '@ngstarter/components/button';
import { RadioButton, RadioGroup } from '@ngstarter/components/radio';

@Component({
  selector: 'app-basic-sidenav-example',
  imports: [
    ReactiveFormsModule,
    SidenavContainer,
    Sidenav,
    Button,
    SidenavContent,
    RadioGroup,
    RadioButton
  ],
  templateUrl: './basic-sidenav-example.html',
  styleUrl: './basic-sidenav-example.scss'
})
export class BasicSidenavExample {
  readonly sidenav = viewChild.required(Sidenav);

  reason = '';
  mode = new FormControl('push' as any);

  async close(reason: string) {
    this.reason = reason;
    await this.sidenav().close();
  }
}
