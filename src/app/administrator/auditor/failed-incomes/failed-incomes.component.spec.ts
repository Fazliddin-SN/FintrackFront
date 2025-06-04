import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FailedIncomesComponent } from './failed-incomes.component';

describe('FailedIncomesComponent', () => {
  let component: FailedIncomesComponent;
  let fixture: ComponentFixture<FailedIncomesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FailedIncomesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FailedIncomesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
