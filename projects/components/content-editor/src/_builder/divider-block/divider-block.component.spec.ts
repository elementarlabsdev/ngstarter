import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DividerBlockComponent } from './divider-block.component';

describe('DividerBlockComponent', () => {
  let component: DividerBlockComponent;
  let fixture: ComponentFixture<DividerBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DividerBlockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DividerBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
