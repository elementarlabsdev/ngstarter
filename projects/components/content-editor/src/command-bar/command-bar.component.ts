import {
  Component, computed,
  inject, Input, OnDestroy, OnInit, Renderer2, signal,
} from '@angular/core';
import { Button } from '@ngstarter/components/button';
import { TextAlignment, TextHighlightService } from '../text-highlight.service';
import { Icon } from '@ngstarter/components/icon';
import { Menu, MenuItem, MenuTrigger } from '@ngstarter/components/menu';
import { ContentEditorItemProperty } from '../types';
import { AddLinkDialog } from '../_dialogs/add-link/add-link.dialog';
import { Dialog } from '@ngstarter/components/dialog';
import { EditLinkDialog } from '../_dialogs/edit-link/edit-link.dialog';
import { DOCUMENT } from '@angular/common';
import { TextColorComponent } from '../text-color/text-color.component';

@Component({
  selector: 'ngs-command-bar',
  imports: [
    Button,
    Icon,
    Menu,
    MenuItem,
    MenuTrigger,
    TextColorComponent
  ],
  templateUrl: './command-bar.component.html',
  styleUrl: './command-bar.component.scss',
  host: {
    'class': 'ngs-command-bar'
  }
})
export class CommandBarComponent implements OnInit, OnDestroy {
  private _document = inject(DOCUMENT);
  private _textHighlightService = inject(TextHighlightService);
  private _renderer = inject(Renderer2);
  private _dialog = inject(Dialog);

  @Input() observedElement: HTMLElement | null = null;

  props = signal<ContentEditorItemProperty[]>([]);

  alignment = computed(() => {
    const alignment = this.props().find(
      prop => prop.name === 'text-alignment'
    );
    return alignment?.value || 'left';
  });

  ngOnInit() {
    this._extractProps();
  }

  toggleBold(): void {
    this._textHighlightService.toggleWrapSelection('strong');
  }

  toggleItalic(): void {
    this._textHighlightService.toggleWrapSelection('em');
  }

  toggleCode(): void {
    this._textHighlightService.toggleWrapSelection('code', undefined, ['code']);
  }

  toggleStrike(): void {
    this._textHighlightService.toggleWrapSelection('s');
  }

  toggleUnderline(): void {
    this._textHighlightService.toggleWrapSelection('u');
  }

  toggleSuperscript(): void {
    this._textHighlightService.toggleWrapSelection('sup');
  }

  toggleSubscript(): void {
    this._textHighlightService.toggleWrapSelection('sub');
  }

  isLinkActive() {
    const fakeSelection = this._document.querySelector('.link-selection');

    if (fakeSelection) {
      return true;
    }

    return this._textHighlightService.isSelectionWrappedInTag('a');
  }

  isActive(tagName: string) {
    return this._textHighlightService.isSelectionWrappedInTag(tagName);
  }

  setTextAlignment(alignment: TextAlignment) {
    this._textHighlightService.setTextAlignment(alignment);
    this._extractProps();
  }

  isTextAlignment(alignment: TextAlignment) {
    return this.alignment() === alignment;
  }

  addLink() {
    this._textHighlightService.toggleWrapSelection('span', undefined, ['link-selection']);
    const dialogRef = this._dialog.open(AddLinkDialog, {
      width: '500px',
      disableClose: true,
      hasBackdrop: true
    });
    dialogRef.afterClosed().subscribe((res: any) => {
      this._textHighlightService.unwrapElementByClassAndSelectContents('link-selection');

      if (res && res.href) {
        this._textHighlightService.toggleWrapSelection('a', undefined, ['link'], {
          href: res.href,
          target: res.openInNewTab ? '_blank' : '_self'
        });
      }
    });
  }

  editLink() {
    const link = this._textHighlightService.getContainingAncestorByTagName('a');
    this._textHighlightService.toggleWrapSelection('span', undefined, ['link-selection']);

    if (!link) {
      return;
    }

    const dialogRef = this._dialog.open(EditLinkDialog, {
      data: {
        href: link.getAttribute('href'),
        openInNewTab: link.getAttribute('target') === '_blank',
      },
      width: '500px',
      disableClose: true,
      hasBackdrop: true
    });
    dialogRef.afterClosed().subscribe((res: any) => {
      this._textHighlightService.unwrapElementByClassAndSelectContents('link-selection');

      if (res) {
        if (res.href) {
          this._renderer.setAttribute(link, 'href', res.href);
          this._renderer.setAttribute(link, 'target', res.openInNewTab ? '_blank' : '_self');
        } else {
          this._textHighlightService.toggleWrapSelection('a');
        }
      }
    });
  }

  protected onMenuOpen() {


    this._textHighlightService.wrapSelection('span', undefined, ['text-selection']);
  }

  protected onMenuClose() {
    let textSelectionElement: HTMLElement | null = this._document.querySelector('.text-selection');

    if (textSelectionElement) {
      if (textSelectionElement.style.color || textSelectionElement.style.backgroundColor) {
        this._renderer.removeClass(textSelectionElement, 'text-selection');
      } else {
        this._textHighlightService.unwrapElementByClassAndSelectContents('text-selection');
      }
    }
  }

  protected preventMenuClose(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
  }

  protected onTextColorChanged(color: string) {
    let textSelectionElement: HTMLElement = this._document.querySelector('.text-selection') as HTMLElement;

    if (color) {
      this._renderer.setStyle(textSelectionElement, 'color', color);
    } else {
      this._renderer.removeStyle(textSelectionElement, 'color');
    }
  }

  protected onBackgroundColorChanged(color: string) {
    let textSelectionElement: HTMLElement = this._document.querySelector('.text-selection')  as HTMLElement;

    if (color) {
      this._renderer.setStyle(textSelectionElement, 'backgroundColor', color);
    } else {
      this._renderer.removeStyle(textSelectionElement, 'backgroundColor');
    }
  }

  private _extractProps() {
    if (!this.observedElement) {
      return;
    }

    const props: ContentEditorItemProperty[] = [];

    for (const attribute of this.observedElement.attributes) {
      if (!attribute.name.startsWith('data-props-')) {
        continue;
      }

      const prop = {
        name: attribute.name.replace('data-props-', ''),
        value: attribute.value
      };
      props.push(prop);
    }

    this.props.set(props);
  }

  ngOnDestroy() {
    this._textHighlightService.unwrapElementByClassAndSelectContents('link-selection');
    this._unwrapTextSelection();
  }

  private _unwrapTextSelection() {
    let textSelectionElement: HTMLElement | null = this._document.querySelector('.text-selection');

    if (textSelectionElement) {
      if (!textSelectionElement.style.color && !textSelectionElement.style.backgroundColor) {
        this._textHighlightService.unwrapElementByClassAndSelectContents('text-selection');
      } else {
        this._renderer.removeClass(textSelectionElement, 'text-selection');
      }
    }
  }
}
