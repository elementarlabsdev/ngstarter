import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionPlayer } from './motion-player';

describe('MotionPlayer', () => {
  let component: MotionPlayer;
  let fixture: ComponentFixture<MotionPlayer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MotionPlayer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MotionPlayer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
