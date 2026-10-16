import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { CdkOverlayOrigin, ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';
import { _IdGenerator } from '@angular/cdk/a11y';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom, isObservable, Subject } from 'rxjs';
import { FORM_FIELD, FormFieldControl } from '@ngstarter-ui/components/form-field';
import { Icon } from '@ngstarter-ui/components/icon';
import { TreeSelectPanel } from '../tree-select-panel/tree-select-panel';
import {
  TreeSelectChildrenLoader,
  TreeSelectKey,
  TreeSelectNode,
  TreeSelectValue,
} from '../tree-select.types';

@Component({
  selector: 'ngs-tree-select',
  exportAs: 'ngsTreeSelect',
  imports: [OverlayModule, Icon, TreeSelectPanel],
  templateUrl: './tree-select.html',
  styleUrl: './tree-select.scss',
  providers: [{ provide: FormFieldControl, useExisting: TreeSelect }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[id]': 'id',
    class: 'ngs-tree-select',
    '[class.ngs-select-disabled]': 'disabled',
    '[class.ngs-select-has-clear]': 'clearable() && !empty',
    '(click)': 'onHostClick()',
  },
})
export class TreeSelect implements ControlValueAccessor, FormFieldControl<TreeSelectValue> {
  private readonly destroyRef = inject(DestroyRef);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger');
  private readonly formField = inject(FORM_FIELD, { optional: true });
  private readonly origin = viewChild<CdkOverlayOrigin>('origin');
  readonly ngControl = inject(NgControl, { self: true, optional: true });
  readonly id = inject(_IdGenerator).getId('ngs-tree-select-');
  readonly stateChanges = new Subject<void>();
  readonly nodes = input<readonly TreeSelectNode[]>([]);
  readonly valueSignal = model<TreeSelectValue>(null, { alias: 'value' });
  readonly multiple = input(false, { transform: booleanAttribute });
  readonly leavesOnly = input(false, { transform: booleanAttribute });
  /** Cascading multiple selection writes enabled loaded leaf values. */
  readonly cascade = input(true, { transform: booleanAttribute });
  readonly searchable = input(true, { transform: booleanAttribute });
  readonly clearable = input(false, { transform: booleanAttribute });
  readonly disabledInput = input(false, { alias: 'disabled', transform: booleanAttribute });
  readonly requiredInput = input(false, { alias: 'required', transform: booleanAttribute });
  readonly placeholderInput = input('Choose an item', { alias: 'placeholder' });
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });
  readonly emptyText = input('No matching items');
  readonly loadChildren = input<TreeSelectChildrenLoader | null>(null);
  readonly selectionChange = output<TreeSelectValue>();
  readonly opened = output<void>();
  readonly closed = output<void>();
  readonly loadError = output<{ node: TreeSelectNode; error: unknown }>();
  readonly panelOpen = signal(false);
  readonly query = signal('');
  readonly overlayWidth = signal<number | string>('auto');
  readonly overlayPositions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
  ];
  readonly describedBy = signal('');
  private readonly formDisabled = signal(false);
  private readonly focusedSignal = signal(false);
  private readonly loaded = signal(
    new Map<
      TreeSelectKey,
      {
        node: TreeSelectNode;
        loader: TreeSelectChildrenLoader;
        children: readonly TreeSelectNode[];
      }
    >(),
  );
  private readonly pending = signal(new Map<TreeSelectKey, object>());
  private readonly errors = signal(new Map<TreeSelectKey, TreeSelectNode>());
  private onChange: (value: TreeSelectValue) => void = () => {};
  private onTouched: () => void = () => {};

  readonly resolvedNodes = computed(() => {
    const cache = this.loaded();
    const loader = this.loadChildren();
    const resolve = (items: readonly TreeSelectNode[], parentDisabled = false): TreeSelectNode[] =>
      items.map((node) => {
        const entry = cache.get(node.value);
        const children =
          entry?.node === node && entry.loader === loader ? entry.children : node.children;
        return {
          ...node,
          disabled: parentDisabled || node.disabled,
          children: children ? resolve(children, parentDisabled || !!node.disabled) : undefined,
          hasChildren: children ? children.length > 0 : node.hasChildren,
        };
      });
    return resolve(this.nodes());
  });
  readonly allNodes = computed(() => {
    const result = new Map<TreeSelectKey, TreeSelectNode>();
    const visit = (nodes: readonly TreeSelectNode[]) =>
      nodes.forEach((node) => {
        result.set(node.value, node);
        visit(node.children ?? []);
      });
    visit(this.resolvedNodes());
    return result;
  });
  readonly displayValue = computed(() =>
    this.selectedValues()
      .map((value) => this.allNodes().get(value)?.label ?? String(value))
      .join(', '),
  );
  readonly selectedValues = computed<TreeSelectKey[]>(() => {
    const value = this.valueSignal();
    return Array.isArray(value) ? value : value == null ? [] : [value];
  });

  constructor() {
    if (this.ngControl) this.ngControl.valueAccessor = this;
    effect(() => {
      this.nodes();
      this.loadChildren();
      untracked(() => {
        this.loaded.set(new Map());
        this.pending.set(new Map());
        this.errors.set(new Map());
      });
    });
    effect(() => {
      this.valueSignal();
      this.focusedSignal();
      this.disabledInput();
      this.formDisabled();
      this.requiredInput();
      this.placeholderInput();
      this.stateChanges.next();
      if (this.disabled && this.panelOpen()) this.close(false);
    });
    this.destroyRef.onDestroy(() => this.stateChanges.complete());
  }

  get value(): TreeSelectValue {
    return this.valueSignal();
  }
  set value(value: TreeSelectValue) {
    this.valueSignal.set(value);
  }
  get placeholder(): string {
    return this.placeholderInput();
  }
  get focused(): boolean {
    return this.focusedSignal() || this.panelOpen();
  }
  get empty(): boolean {
    return this.selectedValues().length === 0;
  }
  get shouldLabelFloat(): boolean {
    return this.focused || !this.empty;
  }
  get disabled(): boolean {
    return this.disabledInput() || this.formDisabled();
  }
  get required(): boolean {
    return this.requiredInput();
  }
  get errorState(): boolean {
    return !!this.ngControl?.invalid && !!this.ngControl?.touched;
  }

  get overlayOrigin(): CdkOverlayOrigin | ElementRef {
    return this.formField?.wrapper() || this.origin() || this.element;
  }
  onHostClick(): void {
    if (!this.formField) this.onContainerClick();
  }
  open(): void {
    if (this.disabled || this.panelOpen()) return;
    const anchor = this.formField?.wrapper()?.nativeElement ?? this.element.nativeElement;
    const width = anchor.getBoundingClientRect().width;
    this.overlayWidth.set(width > 0 ? Math.round(width * 100) / 100 : 'auto');
    this.query.set('');
    this.panelOpen.set(true);
    this.opened.emit();
  }
  close(restoreFocus = true): void {
    if (!this.panelOpen()) return;
    this.panelOpen.set(false);
    this.onTouched();
    this.closed.emit();
    if (restoreFocus) this.focus();
  }
  focus(): void {
    if (!this.disabled) this.trigger()?.nativeElement.focus();
  }
  onFocus(): void {
    this.focusedSignal.set(true);
  }
  onBlur(): void {
    this.focusedSignal.set(false);
    if (!this.panelOpen()) this.onTouched();
  }
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.open();
    }
  }
  clear(event: Event): void {
    event.stopPropagation();
    if (!this.disabled) {
      this.commit(this.multiple() ? [] : null);
      this.onTouched();
    }
  }
  private commit(value: TreeSelectValue): void {
    this.valueSignal.set(value);
    this.onChange(value);
    this.selectionChange.emit(value);
    this.stateChanges.next();
  }
  private targets(node: TreeSelectNode): TreeSelectNode[] {
    const canonical = this.allNodes().get(node.value) ?? node;
    if (canonical.disabled) return [];
    if (this.multiple() && this.cascade() && this.isBranch(canonical)) {
      return (canonical.children ?? []).flatMap((child) => this.targets(child));
    }
    return this.leavesOnly() && this.isBranch(canonical) ? [] : [canonical];
  }
  readonly isBranch = (node: TreeSelectNode): boolean =>
    !!node.children?.length || !!node.hasChildren;
  readonly canSelect = (node: TreeSelectNode): boolean =>
    this.targets(node).length > 0 && !this.disabled;
  readonly isChecked = (node: TreeSelectNode): boolean => {
    const targets = this.targets(node);
    return (
      targets.length > 0 && targets.every((item) => this.selectedValues().includes(item.value))
    );
  };
  readonly isIndeterminate = (node: TreeSelectNode): boolean => {
    const targets = this.targets(node);
    const count = targets.filter((item) => this.selectedValues().includes(item.value)).length;
    return count > 0 && count < targets.length;
  };
  readonly isLoading = (node: TreeSelectNode): boolean => this.pending().has(node.value);
  readonly hasError = (node: TreeSelectNode): boolean => this.errors().has(node.value);

  select(node: TreeSelectNode): void {
    if (!this.canSelect(node)) return;
    if (this.multiple()) {
      const values = new Set(this.selectedValues());
      const remove = this.isChecked(node);
      this.targets(node).forEach((item) =>
        remove ? values.delete(item.value) : values.add(item.value),
      );
      this.commit([...values]);
    } else {
      this.commit(node.value);
      this.close();
    }
  }

  async load(node: TreeSelectNode): Promise<void> {
    const loader = this.loadChildren();
    if (!loader || this.disabled || node.disabled || this.isLoading(node)) return;
    const roots = this.nodes();
    const find = (items: readonly TreeSelectNode[]): TreeSelectNode | undefined => {
      for (const item of items) {
        if (item.value === node.value) return item;
        const found = find(item.children ?? this.loaded().get(item.value)?.children ?? []);
        if (found) return found;
      }
      return undefined;
    };
    const original = find(roots);
    if (!original) return;
    const request = {};
    this.pending.update((items) => new Map(items).set(node.value, request));
    this.errors.update((items) => {
      const next = new Map(items);
      next.delete(node.value);
      return next;
    });
    try {
      const result = loader(original);
      const children = await (isObservable(result)
        ? firstValueFrom(result.pipe(takeUntilDestroyed(this.destroyRef)))
        : result);
      if (!this.destroyRef.destroyed && this.nodes() === roots && this.loadChildren() === loader) {
        this.loaded.update((items) =>
          new Map(items).set(node.value, { node: original, loader, children }),
        );
      }
    } catch (error) {
      if (!this.destroyRef.destroyed && this.nodes() === roots && this.loadChildren() === loader) {
        this.errors.update((items) => new Map(items).set(node.value, original));
        this.loadError.emit({ node: original, error });
      }
    } finally {
      if (!this.destroyRef.destroyed)
        this.pending.update((items) => {
          const next = new Map(items);
          if (next.get(node.value) === request) next.delete(node.value);
          return next;
        });
    }
  }
  writeValue(value: TreeSelectValue): void {
    this.valueSignal.set(value ?? null);
    this.stateChanges.next();
  }
  registerOnChange(fn: (value: TreeSelectValue) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }
  setDescribedByIds(ids: string[]): void {
    this.describedBy.set(ids.join(' '));
  }
  onContainerClick(): void {
    if (!this.disabled) this.panelOpen() ? this.close() : this.open();
  }
}
