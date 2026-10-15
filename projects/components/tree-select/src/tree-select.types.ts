import { Observable } from 'rxjs';

export type TreeSelectKey = string | number;
export type TreeSelectValue = TreeSelectKey | TreeSelectKey[] | null;

/** Values must be unique across the entire tree. Treat input nodes as immutable. */
export interface TreeSelectNode {
  value: TreeSelectKey;
  label: string;
  children?: readonly TreeSelectNode[];
  disabled?: boolean;
  /** Marks an unloaded branch. An empty load result turns it into a leaf. */
  hasChildren?: boolean;
}

export type TreeSelectChildrenLoader = (
  node: TreeSelectNode,
) =>
  | readonly TreeSelectNode[]
  | Promise<readonly TreeSelectNode[]>
  | Observable<readonly TreeSelectNode[]>;
