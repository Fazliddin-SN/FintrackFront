import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllIncomesComponent } from './all-incomes.component';

describe('AllIncomesComponent', () => {
  let component: AllIncomesComponent;
  let fixture: ComponentFixture<AllIncomesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllIncomesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllIncomesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
