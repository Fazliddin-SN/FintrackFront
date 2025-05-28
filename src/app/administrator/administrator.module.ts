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
import { UserExpensesComponent } from './user-expenses/user-expenses.component';

@NgModule({
  declarations: [
    CategoriesListComponent,
    ExpenseCategoriesComponent,
    UsersComponent,
    IncomesComponent,
    ExpensesComponent,
    UserExpensesComponent,
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
