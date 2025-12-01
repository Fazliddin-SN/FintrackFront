import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { GlobalEnvService } from "../globalenv.service";

@Injectable({
  providedIn: "root",
})
export class IncomesService {
  baseUrl: string;
  constructor(private http: HttpClient, private config: GlobalEnvService) {
    this.baseUrl = config.baseUrl;
  }

  addIncome(body: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/income`, { ...body });
  }

  // all incomes
  getIncomes(currentPage: any): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/income?page=` + currentPage + "&size=100"
    );
  }

  //get incomes with filter
  getIncomesWithFilter(
    currentPage: number,
    filterLink: string
  ): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/income?page=` + currentPage + "&size=100" + filterLink
    );
  }

  // update income
  updateIncome(id: number, body: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/income/${id}`, {
      ...body,
    });
  }
  //delete
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/income/${id}`);
  }

  // CHEKC INCOME REALIBILITY
  checkStatus(id: number, status: number): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/income/status/${id}`,
      {},
      {
        params: new HttpParams().set("checkedStatus", status),
      }
    );
  }
}
