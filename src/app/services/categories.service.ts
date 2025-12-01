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
    return this.http.post(`${this.basUrl}/inCategory/add`, { name });
  }

  // All income Cats
  getInCats(): Observable<any> {
    return this.http.get(`${this.basUrl}/inCategory/all`);
  }
  // update income Cats
  updateInCats(catId: string, name: string): Observable<any> {
    return this.http.put(`${this.basUrl}/inCategory/update/${catId}`, { name });
  }
  // delete income cat by id
  deleteInCat(catId: string): Observable<any> {
    return this.http.delete(`${this.basUrl}/inCategory/delete/${catId}`);
  }

  // CRUD OPERATIONS ON EXPENSE CATEGORIES
  addExCat(name: string): Observable<any> {
    return this.http.post(`${this.basUrl}/spdCategory/add`, { name });
  }

  // get all expence Cats
  getExCats(): Observable<any> {
    return this.http.get(`${this.basUrl}/spdCategory/all`);
  }
  // update expense Cat by id
  updateExCat(catId: string, name: string): Observable<any> {
    return this.http.put(`${this.basUrl}/spdCategory/update/${catId}`, {
      name,
    });
  }
  // delete expense cat by id
  deleteExCat(catId: string): Observable<any> {
    return this.http.delete(`${this.basUrl}/spdCategory/delete/${catId}`);
  }
}
