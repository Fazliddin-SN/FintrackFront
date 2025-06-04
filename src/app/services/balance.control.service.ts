import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { GlobalEnvService } from "../globalenv.service";

@Injectable({
  providedIn: "root",
})
export class BalanceControlService {
  baseUrl: string;
  constructor(private http: HttpClient, private config: GlobalEnvService) {
    this.baseUrl = config.baseUrl;
  }
  // providing token in headers

  token: string | null = localStorage.getItem("token");
  headers = new HttpHeaders({
    Authorization: `Bearer ${this.token}`,
  });

  // get current balance
  getCurrentBalance(): Observable<any> {
    return this.http.get(`${this.baseUrl}/balance/current`, {
      headers: this.headers,
    });
  }

  // get total balance per day
  getTotalBalances(currentPage: any): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/balance/total?page=` + currentPage + "&size=50",
      {
        headers: this.headers,
      }
    );
  }

  // get total balance per day
  getTotalBalancesWithFilter(
    currentPage: any,
    filterLink: string
  ): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/balance/total?page=` +
        currentPage +
        "&size=50" +
        filterLink,
      {
        headers: this.headers,
      }
    );
  }
}
