import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLinkDialog } from './edit-link.dialog';

describe('EditLinkDialog', () => {
  let component: EditLinkDialog;
  let fixture: ComponentFixture<EditLinkDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditLinkDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditLinkDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
