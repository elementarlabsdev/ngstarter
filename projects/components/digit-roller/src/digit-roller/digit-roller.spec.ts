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
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
