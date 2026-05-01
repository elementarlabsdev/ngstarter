import { booleanAttribute, Component, effect, ElementRef, inject, input, output } from '@angular/core';

@Component({
  selector: 'ngs-expand',
  exportAs: 'ngsExpand',
  templateUrl: './expand.html',
  styleUrl: './expand.scss',
  host: {
    'class': 'ngs-expand',
    '[class.is-expanded]': '_expanded'
  }
})
export class Expand {
  private _elementRef = inject(ElementRef);

  expanded = input(false, {
    transform: booleanAttribute
  });
  color = input('');
  expandLabel = input('Show more');
  collapseLabel = input('Show less');
  showButtonIfExpanded = input(false, {
    transform: booleanAttribute
  });
  height = input<string>('');

  readonly expandedChange = output<boolean>();

  protected _expanded = false;

  constructor() {
    effect(() => {
      this._expanded = this.expanded();
      (this._elementRef.nativeElement as HTMLElement).style.setProperty('--ngs-expand-fade-color', this.color(), 'important');
      (this._elementRef.nativeElement as HTMLElement).style.setProperty('--ngs-expand-expanded-height', this.height(), 'important');
    });
  }

  get api() {
    return {
      expand: () => this._expand(),
      collapse: () => this._collapse(),
      toggle: () => this._toggle()
    };
  }

  private _toggle() {
    this._expanded = !this._expanded;
    this.expandedChange.emit(this._expanded);
  }

  private _expand() {
    this._expanded = true;
    this.expandedChange.emit(this._expanded);
  }

  private _collapse() {
    this._expanded = false;
    this.expandedChange.emit(this._expanded);
  }
}
