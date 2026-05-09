import { Component, inject } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';
import { SnackBar } from '@ngstarter-ui/components/snack-bar';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [
    Button,
    Icon,
  ],
  templateUrl: './hero.component.html'
})
export class HeroComponent {
  private readonly snackBar = inject(SnackBar);
  private readonly installCommand = 'ng add @ngstarter-ui/components';

  async copyInstallCommand(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.installCommand);
      this.snackBar.open('Command copied to clipboard', undefined, { duration: 2400 });
    } catch {
      this.snackBar.open('Could not copy command', 'Dismiss', { duration: 3200 });
    }
  }
}
