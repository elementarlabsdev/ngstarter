import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLinkDialog } from './add-link.dialog';

describe('AddLinkDialog', () => {
  let component: AddLinkDialog;
  let fixture: ComponentFixture<AddLinkDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddLinkDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddLinkDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
