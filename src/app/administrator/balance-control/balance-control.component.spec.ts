import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalanceControlComponent } from './balance-control.component';

describe('BalanceControlComponent', () => {
  let component: BalanceControlComponent;
  let fixture: ComponentFixture<BalanceControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BalanceControlComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BalanceControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
