import '@angular/compiler';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';

import { NotificationControlsDefDirective } from '../notification-controls-def.directive';
import { NotificationDefDirective } from '../notification-def.directive';
import { Notification } from '../notification/notification';
import { NotificationMessage } from '../notification-message/notification-message';
import { NotificationInterface } from '../types';
import { NotificationList } from './notification-list';

interface TestNotification extends NotificationInterface<{ id: number }> {
  actor: {
    id: number;
    name: string;
    avatarUrl: string;
  };
  id: number;
  type: string;
  title: string;
  createdAt: string;
  isUnread?: boolean;
}

@Component({
  imports: [
    Notification,
    NotificationControlsDefDirective,
    NotificationDefDirective,
    NotificationList,
    NotificationMessage
  ],
  template: `
    <ngs-notification-list
      [notifications]="notifications()"
      [static]="isStatic()"
      (notificationClick)="clicked.set([...clicked(), $event])"
    >
      <ng-template ngsNotificationDef="comment" let-notification>
        <ngs-notification [isUnread]="notification.isUnread">
          <ngs-notification-message>
            <span class="comment-title">{{ notification.title }}</span>
          </ngs-notification-message>
        </ngs-notification>
      </ng-template>

      @if (showInviteDef()) {
        <ng-template ngsNotificationDef="invite" let-notification>
          <ngs-notification [isUnread]="notification.isUnread">
            <ngs-notification-message>
              <span class="invite-title">{{ notification.title }}</span>
            </ngs-notification-message>
          </ngs-notification>
        </ng-template>
      }

      <ng-template ngsNotificationControlsDef let-notification>
        <button type="button" class="notification-control">
          {{ notification.id }}
        </button>
      </ng-template>
    </ngs-notification-list>
  `
})
class NotificationListHost {
  readonly isStatic = signal(true);
  readonly showInviteDef = signal(true);
  readonly clicked = signal<NotificationInterface[]>([]);
  readonly notifications = signal<TestNotification[]>([
    {
      actor: {
        id: 1,
        name: 'Mila Ray',
        avatarUrl: 'mila.svg'
      },
      id: 1,
      type: 'comment',
      title: 'Comment mention',
      createdAt: '1 hour ago',
      isUnread: true
    },
    {
      actor: {
        id: 2,
        name: 'Nolan Kim',
        avatarUrl: 'nolan.svg'
      },
      id: 2,
      type: 'invite',
      title: 'Folder invite',
      createdAt: '2 hours ago'
    }
  ]);
}

describe('NotificationList', () => {
  let fixture: ComponentFixture<NotificationListHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NotificationListHost
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationListHost);
    fixture.detectChanges();
  });

  it('renders typed notification templates for each item', () => {
    const host = fixture.nativeElement as HTMLElement;
    const list = host.querySelector('ngs-notification-list') as HTMLElement;
    const notifications = host.querySelectorAll('ngs-notification');
    const items = host.querySelectorAll('.notification');

    expect(list.getAttribute('role')).toBe('list');
    expect(list.classList.contains('ngs-notification-list')).toBe(true);
    expect(list.classList.contains('is-static')).toBe(true);
    expect(notifications.length).toBe(2);
    expect(items.length).toBe(2);
    expect(Array.from(items).every(item => item.getAttribute('role') === 'listitem')).toBe(true);
    expect(Array.from(items).every(item => item.getAttribute('tabindex') === null)).toBe(true);
    expect(host.querySelector('.comment-title')?.textContent?.trim()).toBe('Comment mention');
    expect(host.querySelector('.invite-title')?.textContent?.trim()).toBe('Folder invite');
  });

  it('projects controls for every notification when a controls template is present', () => {
    const controls = fixture.nativeElement.querySelectorAll('.notification-control') as NodeListOf<HTMLButtonElement>;

    expect(controls.length).toBe(2);
    expect(Array.from(controls).map(control => control.textContent?.trim())).toEqual(['1', '2']);
  });

  it('reflects static mode on the list host', () => {
    fixture.componentInstance.isStatic.set(false);
    fixture.detectChanges();

    const list = fixture.nativeElement.querySelector('ngs-notification-list') as HTMLElement;
    const item = fixture.nativeElement.querySelector('.notification') as HTMLElement;

    expect(list.classList.contains('is-static')).toBe(false);
    expect(item.classList.contains('is-interactive')).toBe(true);
    expect(item.getAttribute('tabindex')).toBe('0');
  });

  it('passes unread state through notification templates', () => {
    const notifications = fixture.nativeElement.querySelectorAll('ngs-notification') as NodeListOf<HTMLElement>;

    expect(notifications[0].classList.contains('is-unread')).toBe(true);
    expect(notifications[1].classList.contains('is-unread')).toBe(false);
  });

  it('emits notificationClick when an interactive notification is clicked', () => {
    fixture.componentInstance.isStatic.set(false);
    fixture.detectChanges();

    const item = fixture.nativeElement.querySelector('.notification') as HTMLElement;

    item.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.clicked().map(notification => notification['id'])).toEqual([1]);
  });

  it('does not emit notificationClick while static', () => {
    const item = fixture.nativeElement.querySelector('.notification') as HTMLElement;

    item.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.clicked()).toEqual([]);
  });

  it('emits notificationClick from keyboard activation when interactive', () => {
    fixture.componentInstance.isStatic.set(false);
    fixture.detectChanges();

    const item = fixture.nativeElement.querySelector('.notification') as HTMLElement;
    const enterEvent = new KeyboardEvent('keydown', {
      bubbles: true,
      key: 'Enter'
    });
    const spaceEvent = new KeyboardEvent('keydown', {
      bubbles: true,
      key: ' '
    });

    item.dispatchEvent(enterEvent);
    item.dispatchEvent(spaceEvent);
    fixture.detectChanges();

    expect(fixture.componentInstance.clicked().map(notification => notification['id'])).toEqual([1, 1]);
  });

  it('does not emit notificationClick from controls', () => {
    fixture.componentInstance.isStatic.set(false);
    fixture.detectChanges();

    const control = fixture.nativeElement.querySelector('.notification-control') as HTMLButtonElement;

    control.click();
    control.dispatchEvent(new KeyboardEvent('keydown', {
      bubbles: true,
      key: 'Enter'
    }));
    fixture.detectChanges();

    expect(fixture.componentInstance.clicked()).toEqual([]);
  });

  it('updates notification definitions when projected templates change', () => {
    const list = fixture.debugElement.children[0].componentInstance as NotificationList<TestNotification>;

    expect(() => list.getNotificationTemplate('invite')).not.toThrow();

    fixture.componentInstance.notifications.set([
      fixture.componentInstance.notifications()[0]
    ]);
    fixture.componentInstance.showInviteDef.set(false);
    fixture.detectChanges();

    expect(() => list.getNotificationTemplate('invite')).toThrow('Invalid type "invite" for notification def');
  });

  it('throws when a notification type has no matching template', () => {
    const list = fixture.debugElement.children[0].componentInstance as NotificationList<TestNotification>;

    expect(() => list.getNotificationTemplate('unknown')).toThrow('Invalid type "unknown" for notification def');
  });
});
