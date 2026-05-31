import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DigitRoller } from './digit-roller';

describe('DigitRoller', () => {
  let component: DigitRoller;
  let fixture: ComponentFixture<DigitRoller>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DigitRoller]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DigitRoller);
    fixture.componentRef.setInput('value', 1234);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
