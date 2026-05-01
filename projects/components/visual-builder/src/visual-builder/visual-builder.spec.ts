import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualBuilder } from './visual-builder';

describe('VisualBuilder', () => {
  let component: VisualBuilder;
  let fixture: ComponentFixture<VisualBuilder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisualBuilder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisualBuilder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
