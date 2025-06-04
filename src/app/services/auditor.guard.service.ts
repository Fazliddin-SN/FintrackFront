import { inject, Injectable } from "@angular/core";
import { AuthService } from "./auth.service";
import { ActivatedRouteSnapshot, CanActivateFn, Router } from "@angular/router";

@Injectable({ providedIn: "root" })
export class AuditorAuthGuardService {
  private authService = inject(AuthService);

  constructor(private router: Router) {}

  canActivate() {
    let isAuditor = localStorage.getItem("roleId");

    if (isAuditor === "5") {
      return true;
    } else {
      this.router.navigate(["/dashboard"]);
      return false;
    }
  }
}
