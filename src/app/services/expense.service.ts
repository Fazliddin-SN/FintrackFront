import { inject, Injectable } from "@angular/core";
import { GlobalEnvService } from "../globalenv.service";
import { Observable } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class ExpenseService {
  baseUrl: string;
  http = inject(HttpClient);
  constructor(private config: GlobalEnvService) {
    this.baseUrl = config.baseUrl;
  }

  // fetching all expenses
  getExpenses(currentPage: number): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/spending?page=` + currentPage + `&size=100`
    );
  }
  //get expenses with filter
  getExpensesWithFilter(
    currentPage: number,
    filterLink: string
  ): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/spending?page=` + currentPage + "&size=100" + filterLink
    );
  }

  // fetching all expenses
  getMyExpenses(currentPage: number): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/spending/my-spending?page=` + currentPage + `&size=100`
    );
  }
  //get expenses with filter
  getMyExpensesWithFilter(
    currentPage: number,
    filterLink: string
  ): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/spending/my-spending?page=` +
        currentPage +
        "&size=100" +
        filterLink
    );
  }

  // add new expense
  addExpense(body: any): Observable<any> {
    // console.log("boyd ", { ...body });

    return this.http.post(`${this.baseUrl}/spending`, { ...body });
  }

  // edit expense by id
  editExpense(expenseId: number, body: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/spending/${expenseId}`, { ...body });
  }

  // delete expense by id
  deleteExpense(expenseId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/spending/${expenseId}`);
  }
}
