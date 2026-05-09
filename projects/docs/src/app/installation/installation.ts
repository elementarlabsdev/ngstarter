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
  installProjectCommand = signal('npx @angular/cli@21 new project-name --style=scss');
  addProjectSchematics = signal('cd project-name\nnpx ng add @ngstarter-ui/components');
}
