import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class GlobalEnvService {
  readonly baseUrl = "http://localhost:3018/api";
  // readonly baseUrl = "http://185.196.213.248:3018/api";
  private http = inject(HttpClient);
  roles: string[] = [];
  constructor() {
    this.loadRoles();
  }
  // LOADING ROLE GLOBALLY
  loadRoles(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/auth/roles`, {});
  }
}
