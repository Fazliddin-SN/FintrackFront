import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { GlobalEnvService } from "../globalenv.service";
import { Observable } from "rxjs";
import { jwtDecode } from "jwt-decode";
import { jwtDecodeToken } from "../interfaces/jwtInterface";
@Injectable({
  providedIn: "root",
})
export class AuthService {
  private basUrl: string;
  private http = inject(HttpClient);
  // providing token in headers
  token: string | null = localStorage.getItem("token");
  headers = new HttpHeaders({
    Authorization: `Bearer ${this.token}`,
  });

  constructor(private config: GlobalEnvService) {
    this.basUrl = this.config.baseUrl;
  }

  // Login
  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.basUrl}/auth/login`, {
      username,
      password,
    });
  }

  // Register
  register(
    username: string,
    password: string,
    role_id: string
  ): Observable<any> {
    return this.http.post(`${this.basUrl}/auth/register`, {
      username,
      password,
      role_id,
    });
  }

  // Load all users
  loadUsers(): Observable<any> {
    return this.http.get<any>(`${this.basUrl}/auth/users`, {
      headers: this.headers,
    });
  }

  // update user data
  updateUser(
    userId: string,
    username: string,
    password: string,
    role_id: number
  ): Observable<any> {
    return this.http.put(
      `${this.basUrl}/auth/users/${userId}`,
      { username, password, role_id },
      { headers: this.headers }
    );
  }

  // delete user data
  deleteUserData(userId: number): Observable<any> {
    return this.http.delete<any>(`${this.basUrl}/auth/users/${userId}`, {
      headers: this.headers,
    });
  }

  getDecodedToken() {
    const token = localStorage.getItem("token");
    if (!token) {
      return null;
    }

    try {
      return jwtDecode<any>(token);
    } catch (error) {
      console.error("Failed to decode JWT ", error);
    }
  }

  // getting user role from decoded token
  getUserRole(): "1" | "2" | "3" | "4" | null {
    const decode = this.getDecodedToken();
    if (!decode) {
      return null;
    }
    return decode.role_id;
  }

  setUserDetails(): any {
    const decoded = this.getDecodedToken();
    const userId = decoded.id;
    const roleId = decoded.role_id;
    localStorage.setItem("userId", userId);
    localStorage.setItem("roleId", roleId);
  }

  logout() {
    localStorage.removeItem("userId");
    localStorage.removeItem("roleId");
  }
}
