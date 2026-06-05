import '@angular/compiler';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';

import { NotificationAvatarDirective } from '../notification-avatar.directive';
import { NotificationActor } from '../notification-actor/notification-actor';
import { NotificationContent } from '../notification-content/notification-content';
import { NotificationMessage } from '../notification-message/notification-message';
import { NotificationTime } from '../notification-time/notification-time';
import { Notification } from './notification';

@Component({
  imports: [
    Notification,
    NotificationActor,
    NotificationAvatarDirective,
    NotificationContent,
    NotificationMessage,
    NotificationTime
  ],
  template: `
    <ngs-notification [isUnread]="isUnread()">
      <span ngsNotificationAvatar class="projected-avatar">A</span>
      <ngs-notification-message>
        <a href="/" ngs-notification-actor class="projected-actor">Mila Ray</a>
        mentioned you
      </ngs-notification-message>
      <ngs-notification-content>
        <span class="projected-content">Launch planning</span>
      </ngs-notification-content>
      <ngs-notification-time>
        <span class="projected-time">Just now</span>
      </ngs-notification-time>
    </ngs-notification>
  `
})
class NotificationHost {
  readonly isUnread = signal(false);
}

describe('Notification', () => {
  let fixture: ComponentFixture<NotificationHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationHost]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationHost);
    fixture.detectChanges();
  });

  it('renders host class and projected notification slots', () => {
    const notification = fixture.nativeElement.querySelector('ngs-notification') as HTMLElement;

    expect(notification.classList.contains('ngs-notification')).toBe(true);
    expect(notification.classList.contains('is-unread')).toBe(false);
    expect(notification.querySelector('.avatar .projected-avatar')?.textContent?.trim()).toBe('A');
    expect(notification.querySelector('.message ngs-notification-message')?.textContent).toContain('mentioned you');
    expect(notification.querySelector('.content .projected-content')?.textContent?.trim()).toBe('Launch planning');
    expect(notification.querySelector('ngs-notification-time .projected-time')?.textContent?.trim()).toBe('Just now');
  });

  it('reflects unread state on the host class', () => {
    fixture.componentInstance.isUnread.set(true);
    fixture.detectChanges();

    const notification = fixture.nativeElement.querySelector('ngs-notification') as HTMLElement;

    expect(notification.classList.contains('is-unread')).toBe(true);
  });

  it('marks anchor actors with link styling state', () => {
    const actor = fixture.nativeElement.querySelector('a[ngs-notification-actor]') as HTMLElement;

    expect(actor.classList.contains('ngs-notification-actor')).toBe(true);
    expect(actor.classList.contains('as-link')).toBe(true);
  });
});
