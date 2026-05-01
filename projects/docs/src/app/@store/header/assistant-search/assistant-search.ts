import {
  Component,
  ElementRef,
  inject,
  OnDestroy,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import { Icon } from '@ngstarter/components/icon';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { FormsModule } from '@angular/forms';
import {
  SuggestionBlock,
  Suggestion, SuggestionIconDirective,
  Suggestions, SuggestionThumbDirective
} from '@ngstarter/components/suggestions';
import { Avatar } from '@ngstarter/components/avatar';
import { Button } from '@ngstarter/components/button';

@Component({
  selector: 'ngs-assistant-search',
  imports: [
    Icon,
    Suggestions,
    SuggestionBlock,
    Suggestion,
    SuggestionIconDirective,
    SuggestionThumbDirective,
    FormsModule,
    Avatar,
    Button,
  ],
  templateUrl: './assistant-search.html',
  styleUrl: './assistant-search.scss',
  host: {
    'class': 'assistant-search',
    '[class.has-dropdown]': '_isAttached'
  }
})
export class AssistantSearch implements OnDestroy {
  private _overlay = inject(Overlay);
  private _viewContainerRef = inject(ViewContainerRef);
  private _elementRef = inject(ElementRef);
  protected _isAttached = false;
  private _overlayRef: OverlayRef;
  protected searchText = '';

  ngOnDestroy(): void {
    this.close();
  }

  focus(event: FocusEvent, suggestionDropdown: TemplateRef<any>) {
    if (this._isAttached) {
      return;
    }

    this._overlayRef = this._overlay.create({
      hasBackdrop: true,
      positionStrategy: this._overlay
        .position()
        .flexibleConnectedTo(this._elementRef)
        .withLockedPosition()
        .withGrowAfterOpen()
        .withPositions(
          [
            {
              originY: 'bottom',
              overlayY: 'top',
              originX: 'start',
              overlayX: 'start',
            }
          ]
        )
    });
    const portal = new TemplatePortal(suggestionDropdown, this._viewContainerRef);
    this._overlayRef.attach(portal);
    this._isAttached = true;
    this._overlayRef
      .outsidePointerEvents()
      .subscribe((event: MouseEvent) => {
        const target = event.target as HTMLElement;

        if (target.closest('.assistant-search')) {
          return;
        }

        this.close();
      })
    ;
  }

  close(): void {
    this._overlayRef?.dispose();
    this._isAttached = false;
  }

  clearText() {
    this.searchText = '';
  }
}
