import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { setupNgStarterComponents } from '../utils';

export interface NgUpdateSchema {
  project?: string;
  skipInstall?: boolean;
  codexSkill?: boolean;
}

export function ngUpdate(options: NgUpdateSchema = {}): Rule {
  return (tree: Tree, context: SchematicContext) => {
    setupNgStarterComponents(tree, context, {
      project: options.project,
      skipInstall: options.skipInstall === true,
      codexSkill: options.codexSkill !== false,
      updateExistingDependencies: true,
      updateExistingPeerDependencies: true,
    });
  };
}
