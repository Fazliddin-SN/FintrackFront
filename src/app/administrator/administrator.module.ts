import {
  CommonModule,
  CurrencyPipe,
  DatePipe,
  NgFor,
  NgIf,
} from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "../app.module";
import { RouterModule } from "@angular/router";
import { administratorRoutes } from "./administrator.routes";
import { CategoriesListComponent } from "./incomeCategories/categories-list/categories-list.component";
import { ExpenseCategoriesComponent } from "./expenseCategories/expense-categories/expense-categories.component";
import { UsersComponent } from "./users/users.component";
import { IncomesComponent } from "./incomes/incomes.component";
import { ExpensesComponent } from "./expenses/expenses.component";
import { UserExpensesComponent } from "./user-expenses/user-expenses.component";
import { AllIncomesComponent } from './auditor/all-incomes/all-incomes.component';
import { SuspiciousIncomesComponent } from './auditor/suspicious-incomes/suspicious-incomes.component';
import { FailedIncomesComponent } from './auditor/failed-incomes/failed-incomes.component';
import { NewIncomesComponent } from './auditor/new-incomes/new-incomes.component';
import { SettingsComponent } from './settings/settings.component';
import { BalanceControlComponent } from './balance-control/balance-control.component';

@NgModule({
  declarations: [
    CategoriesListComponent,
    ExpenseCategoriesComponent,
    UsersComponent,
    IncomesComponent,
    ExpensesComponent,
    UserExpensesComponent,
    AllIncomesComponent,
    SuspiciousIncomesComponent,
    FailedIncomesComponent,
    NewIncomesComponent,
    SettingsComponent,
    BalanceControlComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(administratorRoutes),
    ReactiveFormsModule,
    NgIf,
    NgFor,
    MaterialModule,
    CurrencyPipe,
  ],
})
export class AdministratorModule {}
