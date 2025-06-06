import { Component, inject, OnInit } from "@angular/core";
import PerfectScrollbar from "perfect-scrollbar";
import { AuthService } from "../services/auth.service";

declare const $: any;

//Metadata
export interface RouteInfo {
  path: string;
  title: string;
  type: string;
  icontype: string;
  collapse?: string;
  children?: ChildrenItems[];
}

export interface ChildrenItems {
  path: string;
  title: string;
  ab: string;
  type?: string;
}

// OWNER ROUTES
export const ownerROUTES: RouteInfo[] = [
  {
    path: "/dashboard",
    title: "Dashboard",
    type: "link",
    icontype: "dashboard",
  },
  {
    path: "/uzm/incomes",
    title: "Kirimlar",
    type: "link",
    icontype: "paid",
  },
  {
    path: "/uzm/expenses",
    title: "Chiqimlar",
    type: "link",
    icontype: "paid",
  },
  {
    path: "/uzm/total-balance",
    title: "Umumiy Hisob jadvali",
    type: "link",
    icontype: "paid",
  },
  {
    path: "/uzm/user-expenses",
    title: "Mening Chiqimlarim",
    type: "link",
    icontype: "paid",
  },
  {
    path: "/uzm/users",
    title: "Foydalanuvchilar",
    type: "link",
    icontype: "people",
  },
  {
    path: "/uzm/settings",
    title: "Sozlamalar",
    type: "link",
    icontype: "settings",
  },
];
// MANAGER ROUTES
export const managerROUTES: RouteInfo[] = [
  {
    path: "/dashboard",
    title: "Dashboard",
    type: "link",
    icontype: "dashboard",
  },
  {
    path: "/uzm/incomes",
    title: "Kirimlar",
    type: "link",
    icontype: "paid",
  },
  {
    path: "/uzm/expenses",
    title: "Chiqimlar",
    type: "link",
    icontype: "paid",
  },
  {
    path: "/uzm/user-expenses",
    title: "Mening Chiqimlarim",
    type: "link",
    icontype: "paid",
  },
];

// USER ROUTES
export const userROUTES: RouteInfo[] = [
  {
    path: "/dashboard",
    title: "Dashboard",
    type: "link",
    icontype: "dashboard",
  },
  {
    path: "/uzm/user-expenses",
    title: "Mening Chiqimlarim",
    type: "link",
    icontype: "paid",
  },
];

// AUDITOR
export const auditorROUTES: RouteInfo[] = [
  {
    path: "/dashboard",
    title: "Dashboard",
    type: "link",
    icontype: "dashboard",
  },
  {
    path: "/uzm/auditor-all-incomes",
    title: "Hamma kirimlar",
    type: "link",
    icontype: "paid",
  },
  {
    path: "/uzm/auditor-new-incomes",
    title: "Yangi Kirimlar",
    type: "link",
    icontype: "paid",
  },
  {
    path: "/uzm/auditor-sus-incomes",
    title: "Gumonli Kirimlar",
    type: "link",
    icontype: "paid",
  },
  {
    path: "/uzm/auditor-failed-incomes",
    title: "Failed Kirimlar",
    type: "link",
    icontype: "paid",
  },
  {
    path: "/uzm/user-expenses",
    title: "Mening Chiqimlarim",
    type: "link",
    icontype: "paid",
  },
];

//Menu Items
export const ROUTES: RouteInfo[] = [
  {
    path: "/dashboard",
    title: "Dashboard",
    type: "link",
    icontype: "dashboard",
  },
  {
    path: "/components",
    title: "Components",
    type: "sub",
    icontype: "apps",
    collapse: "components",
    children: [
      { path: "buttons", title: "Buttons", ab: "B" },
      { path: "grid", title: "Grid System", ab: "GS" },
      { path: "panels", title: "Panels", ab: "P" },
      { path: "sweet-alert", title: "Sweet Alert", ab: "SA" },
      { path: "notifications", title: "Notifications", ab: "N" },
      { path: "icons", title: "Icons", ab: "I" },
      { path: "typography", title: "Typography", ab: "T" },
    ],
  },
  {
    path: "/forms",
    title: "Forms",
    type: "sub",
    icontype: "content_paste",
    collapse: "forms",
    children: [
      { path: "regular", title: "Regular Forms", ab: "RF" },
      { path: "extended", title: "Extended Forms", ab: "EF" },
      { path: "validation", title: "Validation Forms", ab: "VF" },
      { path: "wizard", title: "Wizard", ab: "W" },
    ],
  },
  {
    path: "/tables",
    title: "Tables",
    type: "sub",
    icontype: "grid_on",
    collapse: "tables",
    children: [
      { path: "regular", title: "Regular Tables", ab: "RT" },
      { path: "extended", title: "Extended Tables", ab: "ET" },
      { path: "datatables.net", title: "Datatables.net", ab: "DT" },
    ],
  },
  {
    path: "/maps",
    title: "Maps",
    type: "sub",
    icontype: "place",
    collapse: "maps",
    children: [
      { path: "google", title: "Google Maps", ab: "GM" },
      { path: "fullscreen", title: "Full Screen Map", ab: "FSM" },
      { path: "vector", title: "Vector Map", ab: "VM" },
    ],
  },
  {
    path: "/widgets",
    title: "Widgets",
    type: "link",
    icontype: "widgets",
  },
  {
    path: "/charts",
    title: "Charts",
    type: "link",
    icontype: "timeline",
  },
  {
    path: "/calendar",
    title: "Calendar",
    type: "link",
    icontype: "date_range",
  },
  {
    path: "/pages",
    title: "Pages",
    type: "sub",
    icontype: "image",
    collapse: "pages",
    children: [
      { path: "pricing", title: "Pricing", ab: "P" },
      { path: "timeline", title: "Timeline Page", ab: "TP" },
      { path: "login", title: "Login Page", ab: "LP" },
      { path: "register", title: "Register Page", ab: "RP" },
      { path: "lock", title: "Lock Screen Page", ab: "LSP" },
      { path: "user", title: "User Page", ab: "UP" },
    ],
  },
];
@Component({
  selector: "app-sidebar-cmp",
  templateUrl: "sidebar.component.html",
})
export class SidebarComponent implements OnInit {
  public menuItems: any[];
  public authService = inject(AuthService);
  ps: any;
  roleId: string;
  username: string;
  isMobileMenu() {
    if ($(window).width() > 991) {
      return false;
    }
    return true;
  }

  ngOnInit() {
    this.roleId = localStorage.getItem("roleId");
    this.username = localStorage.getItem("username");
    if (this.roleId === "1") {
      this.menuItems = ownerROUTES.filter((menuItem) => menuItem);
    } else if (this.roleId === "2") {
      this.menuItems = userROUTES.filter((menuItem) => menuItem);
    } else if (this.roleId === "3") {
      this.menuItems = managerROUTES.filter((menuItem) => menuItem);
    } else if (this.roleId === "5") {
      this.menuItems = auditorROUTES.filter((menuItem) => menuItem);
    } else {
      this.menuItems = ROUTES.filter((menuItem) => menuItem);
    }

    if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
      const elemSidebar = <HTMLElement>(
        document.querySelector(".sidebar .sidebar-wrapper")
      );
      this.ps = new PerfectScrollbar(elemSidebar);
    }
  }
  updatePS(): void {
    if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
      this.ps.update();
    }
  }
  isMac(): boolean {
    let bool = false;
    if (
      navigator.platform.toUpperCase().indexOf("MAC") >= 0 ||
      navigator.platform.toUpperCase().indexOf("IPAD") >= 0
    ) {
      bool = true;
    }
    return bool;
  }
  expandOrCollapseMenu(id) {
    let parent = document.getElementById(id + "-p");
    let child = document.getElementById(id);
    parent.ariaExpanded = parent.ariaExpanded === "true" ? "false" : "true";
    child.style.height =
      child.style.height === "0px" || child.style.height === "" ? "100%" : "0";
  }
}
