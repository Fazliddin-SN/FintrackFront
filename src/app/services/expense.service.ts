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

  token: string | null = localStorage.getItem("token");
  headers = new HttpHeaders({
    Authorization: `Bearer ${this.token}`,
  });

  // fetching all expenses
  getExpenses(currentPage: number): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/spending?page=` + currentPage + `&size=50`,
      { headers: this.headers }
    );
  }
  //get expenses with filter
  getExpensesWithFilter(
    currentPage: number,
    filterLink: string
  ): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/spending?page=` + currentPage + "&size=50" + filterLink,
      { headers: this.headers }
    );
  }

  // fetching all expenses
  getMyExpenses(currentPage: number): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/spending/my-spending?page=` + currentPage + `&size=50`,
      { headers: this.headers }
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
        "&size=50" +
        filterLink,
      { headers: this.headers }
    );
  }

  // add new expense
  addExpense(body: any): Observable<any> {
    // console.log("boyd ", { ...body });

    return this.http.post(
      `${this.baseUrl}/spending`,
      { ...body },
      { headers: this.headers }
    );
  }

  // edit expense by id
  editExpense(expenseId: number, body: any): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/spending/${expenseId}`,
      { ...body },
      { headers: this.headers }
    );
  }

  // delete expense by id
  deleteExpense(expenseId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/spending/${expenseId}`, {
      headers: this.headers,
    });
  }
}
