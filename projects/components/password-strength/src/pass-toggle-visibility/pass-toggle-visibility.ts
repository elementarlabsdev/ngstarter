import { booleanAttribute, Component, input } from '@angular/core';
import { Icon } from '@ngstarter/components/icon';
import { Button } from '@ngstarter/components/button';

@Component({
  selector: 'ngs-pass-toggle-visibility',
  exportAs: 'ngsPassToggleVisibility',
  imports: [
    Icon,
    Button
  ],
  templateUrl: './pass-toggle-visibility.html',
  styleUrl: './pass-toggle-visibility.scss',
  host: {
    'class': 'ngs-pass-toggle-visibility',
  }
})
export class PassToggleVisibility {
  visible = input(false, {
    transform: booleanAttribute
  });
  tabindex = input('');

  protected _visible = this.visible();

  get type() {
    return this._visible ? 'text' : 'password';
  }
}
