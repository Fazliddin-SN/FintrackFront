import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuspiciousIncomesComponent } from './suspicious-incomes.component';

describe('SuspiciousIncomesComponent', () => {
  let component: SuspiciousIncomesComponent;
  let fixture: ComponentFixture<SuspiciousIncomesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SuspiciousIncomesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuspiciousIncomesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
