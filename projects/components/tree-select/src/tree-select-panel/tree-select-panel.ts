import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { Tree, TreeNode, TreeNodeDef } from '@ngstarter-ui/components/tree';
import { Checkbox } from '@ngstarter-ui/components/checkbox';
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';
import { SelectHeader, SelectBody } from '@ngstarter-ui/components/select';
import { Input } from '@ngstarter-ui/components/input';
import { TreeSelectNode } from '../tree-select.types';

@Component({
  selector: 'ngs-tree-select-panel',
  imports: [Tree, TreeNode, TreeNodeDef, Checkbox, Button, Icon, SelectHeader, SelectBody, Input],
  templateUrl: './tree-select-panel.html',
  styleUrl: './tree-select-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(keydown)': 'onKeydown($event)' },
})
export class TreeSelectPanel {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly tree = viewChild.required<Tree<TreeSelectNode>>('tree');
  readonly nodes = input.required<TreeSelectNode[]>();
  readonly panelId = input.required<string>();
  readonly label = input('Choose an item');
  readonly multiple = input(false);
  readonly searchable = input(true);
  readonly query = input('');
  readonly emptyText = input('No matching items');
  readonly isChecked = input.required<(node: TreeSelectNode) => boolean>();
  readonly isIndeterminate = input.required<(node: TreeSelectNode) => boolean>();
  readonly canSelect = input.required<(node: TreeSelectNode) => boolean>();
  readonly isLoading = input.required<(node: TreeSelectNode) => boolean>();
  readonly hasError = input.required<(node: TreeSelectNode) => boolean>();
  readonly selectNode = output<TreeSelectNode>();
  readonly loadNode = output<TreeSelectNode>();
  readonly queryChange = output<string>();
  readonly dismiss = output<void>();
  readonly hasMatches = computed(() => {
    const query = this.query().trim().toLowerCase();
    const matches = (nodes: readonly TreeSelectNode[]): boolean =>
      nodes.some(
        (node) =>
          node.label.toLowerCase().includes(query) ||
          String(node.value).toLowerCase().includes(query) ||
          matches(node.children ?? []),
      );
    return matches(this.nodes());
  });
  readonly childrenAccessor = (node: TreeSelectNode): TreeSelectNode[] => [
    ...(node.children ?? []),
  ];
  readonly expansionKey = (node: TreeSelectNode) => node.value;
  readonly expandable = (node: TreeSelectNode) => !!node.children?.length || !!node.hasChildren;

  constructor() {
    afterNextRender(() => {
      this.expandSelectedPath(this.nodes());
      this.element.nativeElement
        .querySelector<HTMLElement>('input, ngs-tree-node:not([aria-disabled="true"])')
        ?.focus();
    });
  }

  private expandSelectedPath(nodes: readonly TreeSelectNode[]): boolean {
    let containsSelected = false;
    for (const node of nodes) {
      const selectedChild = this.expandSelectedPath(node.children ?? []);
      if (selectedChild) this.tree().expand(node);
      containsSelected ||= selectedChild || this.isChecked()(node);
    }
    return containsSelected;
  }

  readonly levels = (level: number): number[] => Array.from({ length: level }, (_, index) => index);

  expanded(node: TreeSelectNode, expanded: boolean): void {
    if (expanded && node.hasChildren && !node.children?.length) this.loadNode.emit(node);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.dismiss.emit();
    } else if (event.key === 'Tab') {
      this.dismiss.emit();
    } else if (event.key === 'ArrowDown' && event.target instanceof HTMLInputElement) {
      const first = this.element.nativeElement.querySelector<HTMLElement>(
        'ngs-tree-node:not([aria-disabled="true"])',
      );
      if (first) {
        event.preventDefault();
        first.focus();
      }
    }
  }
}
