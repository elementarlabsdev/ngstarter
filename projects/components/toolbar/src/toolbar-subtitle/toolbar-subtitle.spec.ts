import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolbarSubtitle } from './toolbar-subtitle';

describe('ToolbarSubtitle', () => {
  let component: ToolbarSubtitle;
  let fixture: ComponentFixture<ToolbarSubtitle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToolbarSubtitle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToolbarSubtitle);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
