import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionStudio } from './motion-studio';

describe('MotionStudio', () => {
  let component: MotionStudio;
  let fixture: ComponentFixture<MotionStudio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MotionStudio]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MotionStudio);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
