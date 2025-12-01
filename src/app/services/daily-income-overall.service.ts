import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { GlobalEnvService } from "../globalenv.service";

@Injectable({
  providedIn: "root",
})
export class DailyIncomeOverallService {
  baseUrl: string;

  constructor(private http: HttpClient, private config: GlobalEnvService) {
    this.baseUrl = config.baseUrl;
  }

  /**
   * Create a new daily income overall record
   * POST /daily_In
   * Manager only (roles 3, 1)
   */
  createDailyIncomeOverall(body: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/income/daily_In`, { ...body });
  }

  /**
   * Get all daily income overall records with pagination and filters
   * GET /daily_In
   * Roles: 3, 1, 4
   */
  getDailyIncomeOverall(
    currentPage: number,
    filterLink: string = ""
  ): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/income/daily_In?page=${currentPage}&size=30${filterLink}`
    );
  }

  /**
   * Get today's daily income overall record
   * GET /daily_In/today
   * Roles: 3, 1, 4
   */
  getTodayDailyIncomeOverall(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/income/daily_In/today`);
  }

  /**
   * Get a single daily income overall record by ID
   * GET /daily_In/:id
   * Roles: 3, 1, 4
   */
  getDailyIncomeOverallById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/income/daily_In/${id}`);
  }

  /**
   * Update a daily income overall record (same day only)
   * PUT /daily_In/:id
   * Manager only (roles 3, 1)
   */
  updateDailyIncomeOverall(id: number, body: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/income/daily_In/${id}`, {
      ...body,
    });
  }

  /**
   * Delete a daily income overall record (same day only)
   * DELETE /daily_In/:id
   * Manager only (roles 3, 1)
   */
  deleteDailyIncomeOverall(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/income/daily_In/${id}`);
  }
}
