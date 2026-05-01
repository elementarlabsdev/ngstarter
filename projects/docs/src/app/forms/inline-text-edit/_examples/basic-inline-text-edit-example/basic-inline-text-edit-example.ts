import { Component, signal } from '@angular/core';
import { InlineTextEdit } from '@ngstarter-ui/components/inline-text-edit';
import { Alert } from '@ngstarter-ui/components/alert';
import { Divider } from '@ngstarter-ui/components/divider';

@Component({
  selector: 'app-basic-inline-text-edit-example',
  imports: [
    InlineTextEdit,
    Alert,
    Divider
  ],
  templateUrl: './basic-inline-text-edit-example.html',
  styleUrl: './basic-inline-text-edit-example.scss'
})
export class BasicInlineTextEditExample {
  projectName = signal('My Awesome Project');
  projectDescription = signal(
    'This is a description inside a tag. You can edit me too!'
  );

  onSaveName(value: string) {
    this.projectName.set(value);
  }

  onSaveDescription(value: string) {
    this.projectDescription.set(value);
  }
}
