import { inject, Injectable } from "@angular/core";
import { AuthService } from "./auth.service";
import { ActivatedRouteSnapshot, CanActivateFn, Router } from "@angular/router";

@Injectable({ providedIn: "root" })
export class ManagerAuthGuardService {
  private authService = inject(AuthService);

  constructor(private router: Router) {}

  canActivate() {
    let isManager = localStorage.getItem("roleId");

    if (isManager === "3" || isManager === "1") {
      return true;
    } else {
      this.router.navigate(["/dashboard"]);
      return false;
    }
  }
}
