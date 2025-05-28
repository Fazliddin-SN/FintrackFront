import { Routes } from "@angular/router";

import { CategoriesListComponent } from "./incomeCategories/categories-list/categories-list.component";
import { ExpenseCategoriesComponent } from "./expenseCategories/expense-categories/expense-categories.component";
import { UsersComponent } from "./users/users.component";
import { IncomesComponent } from "./incomes/incomes.component";
import { ExpensesComponent } from "./expenses/expenses.component";

import { UserExpensesComponent } from "./user-expenses/user-expenses.component";
import { OwnerAuthGuardService } from "../services/owner-auth-guard.service";
import { ManagerAuthGuardService } from "../services/manager-auth-gaurd.service";
import { UserAuthGuardService } from "../services/user-auth-guard.service";

export const administratorRoutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "income-categories",
        canActivate: [OwnerAuthGuardService],
        component: CategoriesListComponent,
        data: { title: "Kirim Kategoriyalari" },
      },
      {
        path: "expense-categories",
        canActivate: [OwnerAuthGuardService],
        component: ExpenseCategoriesComponent,
        data: { title: "Chiqim Kategoriyalari" },
      },
      {
        path: "users",
        canActivate: [OwnerAuthGuardService],
        component: UsersComponent,
        data: {
          title: "Foydalanuvchilar",
        },
      },
      {
        path: "incomes",
        canActivate: [ManagerAuthGuardService],
        component: IncomesComponent,
        data: {
          title: "Kirimlar",
        },
      },
      {
        path: "expenses",
        canActivate: [ManagerAuthGuardService],
        component: ExpensesComponent,
        data: {
          title: "Chiqimlar",
        },
      },
      {
        path: "user-expenses",
        canActivate: [UserAuthGuardService],
        component: UserExpensesComponent,
        data: {
          title: "Mening chiqimlarim",
        },
      },
    ],
  },
];
