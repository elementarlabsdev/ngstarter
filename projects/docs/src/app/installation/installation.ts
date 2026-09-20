import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CodeHighlighter } from '@ngstarter-ui/components/code-highlighter';

@Component({
  selector: 'app-installation',
  imports: [
    CodeHighlighter
  ],
  providers: [],
  templateUrl: './installation.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './installation.scss'
})
export class Installation {
  installProjectCommand = signal('npx @angular/cli@22 new project-name --style=scss');
  addProjectSchematics = signal('cd project-name\nnpx ng add @ngstarter-ui/components');
  skipCodexSkillCommand = signal('npx ng add @ngstarter-ui/components --codex-skill=false');
  updateCodexSkillCommand = signal('npx ng generate @ngstarter-ui/components:codex-skill');
}
