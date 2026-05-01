import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextColorComponent } from './text-color.component';

describe('TextColorComponent', () => {
  let component: TextColorComponent;
  let fixture: ComponentFixture<TextColorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextColorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TextColorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
