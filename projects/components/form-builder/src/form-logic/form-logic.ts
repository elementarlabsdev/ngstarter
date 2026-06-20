import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { EmptyState, EmptyStateContent, EmptyStateIcon, EmptyStateTitle } from '@ngstarter-ui/components/empty-state';
import { Icon } from '@ngstarter-ui/components/icon';
import { FormBuilderSchema } from '../types';

@Component({
  selector: 'ngs-form-logic',
  exportAs: 'ngsFormLogic',
  imports: [
    EmptyState,
    EmptyStateContent,
    EmptyStateIcon,
    EmptyStateTitle,
    Icon
  ],
  templateUrl: './form-logic.html',
  styleUrl: './form-logic.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-form-logic'
  }
})
export class FormLogic {
  readonly schema = input<FormBuilderSchema | null>(null);
  readonly title = input('Form logic');
  readonly description = input('Visual rules for field visibility and calculations will be configured here.');
}
