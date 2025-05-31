import { HttpClient, HttpHeaders } from "@angular/common/http";
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
  // providing token in headers

  token: string | null = localStorage.getItem("token");
  headers = new HttpHeaders({
    Authorization: `Bearer ${this.token}`,
  });

  addIncome(body: any): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/income`,
      { ...body },
      { headers: this.headers }
    );
  }

  // all incomes
  getIncomes(currentPage: any): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/income?page=` + currentPage + "&size=50",
      { headers: this.headers }
    );
  }

  //get incomes with filter
  getIncomesWithFilter(
    currentPage: number,
    filterLink: string
  ): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/income?page=` + currentPage + "&size=50" + filterLink,
      { headers: this.headers }
    );
  }

  // update income
  updateIncome(id: string, body: any): Observable<any> {
    return this.http.put<any>(
      `${this.baseUrl}/income/${id}`,
      {
        ...body,
      },
      { headers: this.headers }
    );
  }
  //delete
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/income/${id}`, {
      headers: this.headers,
    });
  }
}
