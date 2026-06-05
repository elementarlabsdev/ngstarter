import '@angular/compiler';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';

import { NotificationControlsDefDirective } from '../notification-controls-def.directive';
import { NotificationDefDirective } from '../notification-def.directive';
import { Notification } from '../notification/notification';
import { NotificationMessage } from '../notification-message/notification-message';
import { NotificationList } from './notification-list';

interface TestNotification {
  actor: {
    id: number;
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
    <ngs-notification-list [notifications]="notifications()" [static]="isStatic()">
      <ng-template ngsNotificationDef="comment" let-notification>
        <ngs-notification [isUnread]="notification.isUnread">
          <ngs-notification-message>
            <span class="comment-title">{{ notification.title }}</span>
          </ngs-notification-message>
        </ngs-notification>
      </ng-template>

      <ng-template ngsNotificationDef="invite" let-notification>
        <ngs-notification [isUnread]="notification.isUnread">
          <ngs-notification-message>
            <span class="invite-title">{{ notification.title }}</span>
          </ngs-notification-message>
        </ngs-notification>
      </ng-template>

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
  readonly notifications = signal<TestNotification[]>([
    {
      actor: {
        id: 1
      },
      id: 1,
      type: 'comment',
      title: 'Comment mention',
      createdAt: '1 hour ago',
      isUnread: true
    },
    {
      actor: {
        id: 2
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

    expect(list.classList.contains('ngs-notification-list')).toBe(true);
    expect(list.classList.contains('is-static')).toBe(true);
    expect(notifications.length).toBe(2);
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

    expect(list.classList.contains('is-static')).toBe(false);
  });

  it('passes unread state through notification templates', () => {
    const notifications = fixture.nativeElement.querySelectorAll('ngs-notification') as NodeListOf<HTMLElement>;

    expect(notifications[0].classList.contains('is-unread')).toBe(true);
    expect(notifications[1].classList.contains('is-unread')).toBe(false);
  });

  it('throws when a notification type has no matching template', () => {
    const list = fixture.debugElement.children[0].componentInstance as NotificationList<TestNotification>;

    expect(() => list.getNotificationTemplate('unknown')).toThrow('Invalid type "unknown" for notification def');
  });
});
