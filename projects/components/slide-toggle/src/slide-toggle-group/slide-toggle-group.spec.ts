import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlideToggleGroup } from './slide-toggle-group';

describe('SlideToggleGroup', () => {
  let component: SlideToggleGroup;
  let fixture: ComponentFixture<SlideToggleGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlideToggleGroup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlideToggleGroup);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
