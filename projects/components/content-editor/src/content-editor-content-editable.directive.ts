import {
  Directive,
  ElementRef,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
  PLATFORM_ID,
  Renderer2,
  signal
} from '@angular/core';
import { ContentEditorItemProperty } from './types';
import { isPlatformServer } from '@angular/common';

@Directive({
  selector: '[ngsContentEditorContentEditable]',
  exportAs: 'ngsContentEditorContentEditable',
  host: {
    '[class.ngs-content-editor-content-editable]': 'true',
    '(blur)': '_handleBlur($event)',
    '(input)': '_handleInput($event)',
    '(keypress)': '_handleKeyPress($event)',
  }
})
export class ContentEditorContentEditableDirective implements OnInit, OnDestroy {
  private _platformId = inject(PLATFORM_ID);
  private _elementRef = inject(ElementRef);
  private _renderer = inject(Renderer2);
  readonly contentChanged = output<string>();
  readonly pressedEnter = output<KeyboardEvent>();
  readonly initialized = output<void>();
  private _observer!: MutationObserver;

  content = input<string>('', {
    alias: 'ngsContentEditorContentEditable'
  });
  settings = input<any>({});
  props = input<ContentEditorItemProperty[]>([]);

  _props = signal<ContentEditorItemProperty[]>([]);

  readonly propsChanged = output<ContentEditorItemProperty[]>();

  private _isAlreadyRendered = false;

  ngOnInit() {
    this._props.set(this.props() || []);
    (this.props() || []).forEach(prop => {
      this._renderer.setAttribute(this._elementRef.nativeElement, `data-props-${prop.name}`, prop.value);
    });
    this._renderer.setAttribute(this._elementRef.nativeElement, 'contenteditable', 'true');

    if (this._isAlreadyRendered) {
      return;
    }

    if (this.content()) {
      this._elementRef.nativeElement.innerHTML = this.content();
    }

    this._isAlreadyRendered = true;
    this.initialized.emit();

    let prevContent = this.getContent();

    if (isPlatformServer(this._platformId)) {
      return;
    }

    const config = { attributes: true, childList: true, subtree: true };
    const callback = (mutationList: any, observer: any) => {
      for (const mutation of mutationList) {
        if (mutation.type === 'attributes') {
          if (mutation.attributeName.startsWith('data-props-')) {
            const prevPropsHash = JSON.stringify(this._props());
            const propName = mutation.attributeName.replace('data-props-', '');
            const propValue = mutation.target.getAttribute(mutation.attributeName);
            const propIndex = this._props().findIndex(p => p.name === propName);

            if (propIndex >= 0) {
              this._props.update((props: ContentEditorItemProperty[]) => {
                props[propIndex].value = propValue;
                return props;
              });
            } else {
              this._props.update((props: ContentEditorItemProperty[]) => {
                props.push({
                  name: propName,
                  value: propValue,
                })
                return props;
              });
            }

            const updatedPropsHash = JSON.stringify(this._props());

            if (prevPropsHash !== updatedPropsHash) {
              this.propsChanged.emit(this._props());
            }
          }
        } else {
          const currentContent = this.getContent();

          if (prevContent !== currentContent) {
            prevContent = currentContent;
            this._raiseUpdateEvent();
          }
        }
      }
    };
    this._observer = new MutationObserver(callback);
    this._observer.observe(this._elementRef.nativeElement, config);
  }

  ngOnDestroy() {
    this._observer?.disconnect();
  }

  getContent(): string {
    let content = this._elementRef.nativeElement.innerHTML as string;
    content = content.replaceAll('<br>', '').replaceAll(/&nbsp;/g, ' ').trim();

    if (content.length === 0) {
      this._elementRef.nativeElement.innerHTML = '';
    }

    return content;
  }

  protected _handleBlur(event: Event) {
  }

  protected _handleInput(event: Event) {
    if (!this._isAlreadyRendered) {
      return;
    }

    this._raiseUpdateEvent();
  }

  protected _raiseUpdateEvent() {
    this.contentChanged.emit(this.getContent());
  }

  protected _handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.pressedEnter.emit(event);
    }
  }
}
