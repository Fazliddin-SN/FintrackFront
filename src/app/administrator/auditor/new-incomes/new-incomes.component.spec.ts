import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewIncomesComponent } from './new-incomes.component';

describe('NewIncomesComponent', () => {
  let component: NewIncomesComponent;
  let fixture: ComponentFixture<NewIncomesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewIncomesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewIncomesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
