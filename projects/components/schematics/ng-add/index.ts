import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { setupNgStarterComponents } from '../utils';

export interface NgAddSchema {
  project?: string;
  skipInstall?: boolean;
  codexSkill?: boolean;
}

export function ngAdd(options: NgAddSchema = {}): Rule {
  return (tree: Tree, context: SchematicContext) => {
    setupNgStarterComponents(tree, context, {
      project: options.project,
      skipInstall: options.skipInstall === true,
      codexSkill: options.codexSkill !== false,
      updateExistingDependencies: true,
      updateExistingPeerDependencies: false,
    });
  };
}
