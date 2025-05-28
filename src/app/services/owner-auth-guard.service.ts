import { inject, Injectable } from "@angular/core";
import { AuthService } from "./auth.service";
import { ActivatedRouteSnapshot, CanActivateFn, Router } from "@angular/router";

@Injectable({ providedIn: "root" })
export class OwnerAuthGuardService {
  private authService = inject(AuthService);

  constructor(private router: Router) {}

  canActivate() {
    let isOwner = localStorage.getItem("roleId");

    if (isOwner === "1") {
      return true;
    } else {
      this.router.navigate(["/dashboard"]);
      return false;
    }
  }
}
