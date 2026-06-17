import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { setupNgStarterCodexSkill } from '../utils';

export function codexSkill(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    setupNgStarterCodexSkill(tree, context);
  };
}
