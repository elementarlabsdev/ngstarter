import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  contentChildren,
  input,
  output,
  TemplateRef
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { NotificationDefDirective } from '../notification-def.directive';
import { NotificationControlsDefDirective } from '../notification-controls-def.directive';
import { NotificationInterface } from '../types';

@Component({
  selector: 'ngs-notification-list',
  exportAs: 'ngsNotificationList',
  imports: [
    NgTemplateOutlet
  ],
  templateUrl: './notification-list.html',
  styleUrl: './notification-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-notification-list',
    '[class.is-static]': 'static()',
    'role': 'list'
  }
})
export class NotificationList<T extends NotificationInterface> {
  readonly defs = contentChildren(NotificationDefDirective);
  readonly controlsDef = contentChild(NotificationControlsDefDirective);

  notifications = input<T[]>([]);
  static = input(true, {
    transform: booleanAttribute
  });

  readonly notificationClick = output<T>();

  protected _initialized = true;
  protected readonly _defsMap = computed(() => {
    const defsMap = new Map<string, TemplateRef<any>>();

    this.defs().forEach((def: NotificationDefDirective) => {
      defsMap.set(def.ngsNotificationDef(), def.templateRef);
    });

    return defsMap;
  });

  get controlsTpl(): TemplateRef<any> {
    return this.controlsDef()?.templateRef as TemplateRef<any>;
  }

  getNotificationTemplate(type: string): TemplateRef<any> {
    const defsMap = this._defsMap();

    if (!defsMap.has(type)) {
      throw new Error(`Invalid type "${type}" for notification def`);
    }

    return defsMap.get(type) as TemplateRef<any>;
  }

  protected handleNotificationClick(notification: T, event: Event) {
    if (!this.static() && !this.isEventFromInteractiveElement(event)) {
      this.notificationClick.emit(notification);
    }
  }

  protected handleNotificationKeydown(notification: T, event: KeyboardEvent) {
    if (this.static() || this.isEventFromInteractiveElement(event)) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.notificationClick.emit(notification);
    }
  }

  protected stopControlsEvent(event: Event) {
    event.stopPropagation();
  }

  private isEventFromInteractiveElement(event: Event): boolean {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return false;
    }

    return !!target.closest('a,button,input,select,textarea,[role="link"],[role="menuitem"],.controls');
  }
}
