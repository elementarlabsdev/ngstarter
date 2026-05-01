import { Component, signal } from '@angular/core';
import { CodeHighlighter } from '@ngstarter-ui/components/code-highlighter';

@Component({
  selector: 'app-installation',
  imports: [
    CodeHighlighter
  ],
  providers: [],
  templateUrl: './installation.html',
  styleUrl: './installation.scss'
})
export class Installation {
  installProjectCommand = signal('ng new project-name --style=scss');
  addProjectSchematics = signal('ng add @ngstarter-ui/components');
}
