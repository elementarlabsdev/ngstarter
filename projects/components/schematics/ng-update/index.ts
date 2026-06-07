import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { setupNgStarterComponents } from '../utils';

export interface NgUpdateSchema {
  project?: string;
  skipInstall?: boolean;
}

export function ngUpdate(options: NgUpdateSchema = {}): Rule {
  return (tree: Tree, context: SchematicContext) => {
    setupNgStarterComponents(tree, context, {
      project: options.project,
      skipInstall: options.skipInstall === true,
      updateExistingDependencies: true,
      updateExistingPeerDependencies: true,
    });
  };
}
