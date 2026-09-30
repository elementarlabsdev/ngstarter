import { TestBed } from '@angular/core/testing';
import { Skeleton } from './skeleton';

describe('Skeleton', () => {
  it('updates rounded corners when roundedFull changes', async () => {
    await TestBed.configureTestingModule({ imports: [Skeleton] }).compileComponents();
    const fixture = TestBed.createComponent(Skeleton);
    fixture.detectChanges();

    expect(fixture.nativeElement.classList.contains('rounded-full')).toBe(false);

    fixture.componentRef.setInput('roundedFull', '');
    fixture.detectChanges();
    expect(fixture.nativeElement.classList.contains('rounded-full')).toBe(true);

    fixture.componentRef.setInput('roundedFull', 'false');
    fixture.detectChanges();
    expect(fixture.nativeElement.classList.contains('rounded-full')).toBe(false);
  });
});
