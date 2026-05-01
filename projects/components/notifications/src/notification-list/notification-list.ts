import {
  AfterContentInit, booleanAttribute,
  Component,
  contentChild,
  contentChildren,
  input,
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
  host: {
    'class': 'ngs-notification-list',
    '[class.is-static]': 'static()'
  }
})
export class NotificationList<T extends NotificationInterface> implements AfterContentInit {
  readonly defs = contentChildren(NotificationDefDirective);
  readonly controlsDef = contentChild(NotificationControlsDefDirective);

  notifications = input<T[]>([]);
  static = input(true, {
    transform: booleanAttribute
  });

  protected _initialized = false;
  protected _defsMap = new Map<string, TemplateRef<any>>();

  get controlsTpl(): TemplateRef<any> {
    return this.controlsDef()?.templateRef as TemplateRef<any>;
  }

  ngAfterContentInit() {
    this.defs().forEach((def: NotificationDefDirective) => {
      this._defsMap.set(def.ngsNotificationDef(), def.templateRef);
    });
    this._initialized = true;
  }

  getNotificationTemplate(type: string): TemplateRef<any> {
    if (!this._defsMap.has(type)) {
      throw new Error(`Invalid type "${type}" for notification def`);
    }

    return this._defsMap.get(type) as TemplateRef<any>;
  }
}
