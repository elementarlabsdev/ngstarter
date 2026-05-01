import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableBlockComponent } from './table-block.component';

describe('TableBlockComponent', () => {
  let component: TableBlockComponent;
  let fixture: ComponentFixture<TableBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableBlockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
