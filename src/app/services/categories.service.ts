import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { GlobalEnvService } from "../globalenv.service";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class CategoriesService {
  private basUrl: string;
  private http = inject(HttpClient);

  constructor(private config: GlobalEnvService) {
    this.basUrl = this.config.baseUrl;
  }
  // providing token in headers
  token: string | null = localStorage.getItem("token");
  headers = new HttpHeaders({
    Authorization: `Bearer ${this.token}`,
  });

  // CRUD OPERTATION ON INCOME CATEGORIES
  addInCat(name: string): Observable<any> {
    return this.http.post(
      `${this.basUrl}/inCategory/add`,
      { name },
      { headers: this.headers }
    );
  }

  // All income Cats
  getInCats(): Observable<any> {
    return this.http.get(`${this.basUrl}/inCategory/all`, {
      headers: this.headers,
    });
  }
  // update income Cats
  updateInCats(catId: string, name: string): Observable<any> {
    return this.http.put(
      `${this.basUrl}/inCategory/update/${catId}`,
      { name },
      { headers: this.headers }
    );
  }
  // delete income cat by id
  deleteInCat(catId: string): Observable<any> {
    return this.http.delete(`${this.basUrl}/inCategory/delete/${catId}`, {
      headers: this.headers,
    });
  }

  // CRUD OPERATIONS ON EXPENSE CATEGORIES
  addExCat(name: string): Observable<any> {
    return this.http.post(
      `${this.basUrl}/spdCategory/add`,
      { name },
      { headers: this.headers }
    );
  }

  // get all expence Cats
  getExCats(): Observable<any> {
    return this.http.get(`${this.basUrl}/spdCategory/all`, {
      headers: this.headers,
    });
  }
  // update expense Cat by id
  updateExCat(catId: string, name: string): Observable<any> {
    return this.http.put(
      `${this.basUrl}/spdCategory/update/${catId}`,
      { name },
      { headers: this.headers }
    );
  }
  // delete expense cat by id
  deleteExCat(catId: string): Observable<any> {
    return this.http.delete(`${this.basUrl}/spdCategory/delete/${catId}`, {
      headers: this.headers,
    });
  }
}
