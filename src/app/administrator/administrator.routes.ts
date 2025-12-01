import { Routes } from "@angular/router";

import { UsersComponent } from "./users/users.component";
import { IncomesComponent } from "./incomes/incomes.component";
import { ExpensesComponent } from "./expenses/expenses.component";

import { UserExpensesComponent } from "./user-expenses/user-expenses.component";
import { OwnerAuthGuardService } from "../services/owner-auth-guard.service";
import { ManagerAuthGuardService } from "../services/manager-auth-gaurd.service";
import { UserAuthGuardService } from "../services/user-auth-guard.service";
import { AuditorAuthGuardService } from "../services/auditor.guard.service";
import { AllIncomesComponent } from "./auditor/all-incomes/all-incomes.component";

import { NewIncomesComponent } from "./auditor/new-incomes/new-incomes.component";
import { SuspiciousIncomesComponent } from "./auditor/suspicious-incomes/suspicious-incomes.component";
import { FailedIncomesComponent } from "./auditor/failed-incomes/failed-incomes.component";
import { SettingsComponent } from "./settings/settings.component";
import { BalanceControlComponent } from "./balance-control/balance-control.component";
import { DailyIncomeOverallComponent } from "./daily-income-overall/daily-income-overall.component";

export const administratorRoutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "settings",
        canActivate: [OwnerAuthGuardService],
        component: SettingsComponent,
        data: { title: "Sozlamalar" },
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
        path: "total-balance",
        canActivate: [OwnerAuthGuardService],
        component: BalanceControlComponent,
        data: {
          title: "Umumiy Hisob Jadvali",
        },
      },
      {
        path: "daily_ov_income",
        canActivate: [ManagerAuthGuardService],
        component: DailyIncomeOverallComponent,
        data: {
          title: "Umumiy Kirimlar",
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
      {
        path: "auditor-all-incomes",
        canActivate: [AuditorAuthGuardService],
        component: AllIncomesComponent,
        data: {
          title: "Umumiya Kirimlar",
        },
      },
      {
        path: "auditor-new-incomes",
        canActivate: [AuditorAuthGuardService],
        component: NewIncomesComponent,
        data: {
          title: "Yangi Kiritilgan Kirimlar",
        },
      },
      {
        path: "auditor-sus-incomes",
        canActivate: [AuditorAuthGuardService],
        component: SuspiciousIncomesComponent,
        data: {
          title: "Gumonli Kirimlar",
        },
      },
      {
        path: "auditor-failed-incomes",
        canActivate: [AuditorAuthGuardService],
        component: FailedIncomesComponent,
        data: {
          title: "Failed Kirimlar",
        },
      },
    ],
  },
];
