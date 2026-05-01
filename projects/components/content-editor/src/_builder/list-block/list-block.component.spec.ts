import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListBlockComponent } from './list-block.component';

describe('ListBlockComponent', () => {
  let component: ListBlockComponent;
  let fixture: ComponentFixture<ListBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListBlockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
