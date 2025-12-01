import { Injectable } from "@angular/core";
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
  HttpResponse,
} from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { Router } from "@angular/router";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = localStorage.getItem("token");

    // Add token
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    // Log request (optional - remove in production)
    console.log("Request:", req.method, req.url);

    return next.handle(req).pipe(
      tap((event) => {
        // Log response (optional)
        if (event instanceof HttpResponse) {
          //   console.log("Response:", event.status, event.url);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error("Unauthorized - redirecting to login");
          localStorage.clear();
          this.router.navigate(["/login"]);
        } else if (error.status === 403) {
          console.error("Forbidden - insufficient permissions");
          // You can show a toast/notification here
        } else if (error.status === 500) {
          console.error("Server error");
        }
        return throwError(() => error);
      })
    );
  }
}
