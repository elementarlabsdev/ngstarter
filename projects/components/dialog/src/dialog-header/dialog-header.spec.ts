import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogHeader } from './dialog-header';

describe('DialogHeader', () => {
  let component: DialogHeader;
  let fixture: ComponentFixture<DialogHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogHeader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
