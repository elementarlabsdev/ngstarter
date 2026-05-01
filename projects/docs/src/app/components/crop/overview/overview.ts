import { Component, model, signal } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Crop, CropSelection } from '@ngstarter/components/crop';
import { FormsModule } from '@angular/forms';
import { FormField } from '@ngstarter/components/form-field';
import { Option, Select } from '@ngstarter/components/select';
import { JsonPipe } from '@angular/common';

@Component({
  imports: [
    Page,
    PageContentDirective,
    PageTitleDirective,
    Crop,
    FormField,
    Select,
    Option,
    FormsModule,
    JsonPipe
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {
  cropShape = model<'rectangle' | 'circle'>('rectangle');
  selection = signal<CropSelection | null>(null);

  onSelectionApplied(selection: CropSelection) {
    console.log(selection);
    this.selection.set(selection);
  }
}
