import { inject, Injectable } from "@angular/core";
import { AuthService } from "./auth.service";
import { ActivatedRouteSnapshot, CanActivateFn, Router } from "@angular/router";

@Injectable({ providedIn: "root" })
export class UserAuthGuardService {
  private authService = inject(AuthService);

  constructor(private router: Router) {}

  canActivate() {
    let isUser = localStorage.getItem("roleId");

    if (isUser === "1" || isUser === "2" || isUser === "3" || isUser === "5") {
      return true;
    } else {
      this.router.navigate(["/dashboard"]);
      return false;
    }
  }
}
