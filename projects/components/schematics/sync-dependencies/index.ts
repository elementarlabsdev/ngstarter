import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { syncNgStarterComponentDependencies } from '../utils';

export interface SyncDependenciesSchema {
  skipInstall?: boolean;
}

export function syncDependencies(options: SyncDependenciesSchema = {}): Rule {
  return (tree: Tree, context: SchematicContext) => {
    syncNgStarterComponentDependencies(tree, context, {
      skipInstall: options.skipInstall === true,
      updateExistingDependencies: true,
      updateExistingPeerDependencies: false,
    });
  };
}
