import { Component, signal } from '@angular/core';
import {
  CookiePopupAcceptAllButtonDirective,
  CookiePopupAcceptNecessaryOnlyButtonDirective,
  CookiePopupAcceptType,
  CookiePopup,
  CookiePopupTitleDirective
} from '@ngstarter/components/cookie-popup';
import { Button } from '@ngstarter/components/button';

@Component({
  selector: 'app-basic-cookie-popup-example',
  imports: [
    CookiePopup,
    Button,
    CookiePopupTitleDirective,
    CookiePopupAcceptAllButtonDirective,
    CookiePopupAcceptNecessaryOnlyButtonDirective
  ],
  templateUrl: './basic-cookie-popup-example.html',
  styleUrl: './basic-cookie-popup-example.scss'
})
export class BasicCookiePopupExample {
  visible = signal(true);

  acceptType = signal<CookiePopupAcceptType | null>(null);

  onCookieAccepted(acceptType: CookiePopupAcceptType) {
    this.acceptType.set(acceptType);
  }
}
