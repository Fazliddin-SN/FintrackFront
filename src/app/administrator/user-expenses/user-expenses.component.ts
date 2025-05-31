import { DatePipe } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { Sort } from "@angular/material/sort";
import { ExpenseService } from "src/app/services/expense.service";

declare interface TableData {
  headerRow: string[];
}

@Component({
  selector: "app-user-expenses",
  templateUrl: "./user-expenses.component.html",
  styleUrls: ["./user-expenses.component.css"],
})
export class UserExpensesComponent implements OnInit {
  private expenseService = inject(ExpenseService);

  expenseList: string[] = [];
  errorMessage: string;
  tableData1: TableData;

  danValue: string;
  gachaValue: string;

  // pagination
  currentPage: number = 0;
  totalPages: number;
  needPagination: boolean;
  mypages = [];
  isPagesActive: boolean;
  staff_id: string;

  constructor(private datePipe: DatePipe) {
    this.loadExpenses();
  }

  ngOnInit(): void {
    this.tableData1 = {
      headerRow: [
        "№/Jami",
        "So'mda",
        "Dollarda",
        "Kartadan",
        "Izoh",
        "Manager IDsi",
        "Kategoriyasi",
        "Sanasi",
      ],
    };
    this.loadExpenses();
    this.staff_id = localStorage.getItem("userId");
  }

  pagebyNum(ipage) {
    this.currentPage = ipage;
    this.isPagesActive = true;
    document.getElementById("listcard").scrollIntoView();
    this.loadExpenses();
  }

  fromFunction(date) {
    this.danValue = this.datePipe.transform(date.value, "yyyy-MM-dd");
  }

  toFunction(date) {
    this.gachaValue = this.datePipe.transform(date.value, "yyyy-MM-dd");
  }

  sortComment: string = "";
  sortField: string = "";
  sortDirection: string = "";

  // Called when user sorts a column
  sortData(sort: Sort) {
    if (!sort.active || sort.direction === "") {
      this.sortField = "";
      this.sortDirection = "";
    } else {
      this.sortField = sort.active;
      this.sortDirection = sort.direction;
    }

    if (this.danValue || this.gachaValue) {
      return this.getListOfExpensesWithDate();
    }

    // Reuse existing filter + sort values
    this.getListOfExpensesWIthFilter(
      this.sortComment,
      this.danValue,
      this.gachaValue,
      this.sortField,
      this.sortDirection
    );
  }

  // Called when user applies a filter (e.g. selects category, comment, staff)
  applyFilters(comment: string) {
    this.sortComment = comment;

    // Reuse last sort field + direction

    // Reuse last sort field + direction
    this.getListOfExpensesWIthFilter(
      comment,
      this.danValue,
      this.gachaValue,
      this.sortField,
      this.sortDirection
    );
  }

  // LOADING EXPENSES WITHOUT FILTER
  loadExpenses() {
    this.expenseService.getMyExpenses(this.currentPage).subscribe({
      next: (res) => {
        this.expenseList = res.expenses;
        console.log("expense list ", this.expenseList);

        this.currentPage = res.currentPage;
        this.totalPages = res.totalPages;
        if (this.totalPages > 1) {
          this.needPagination = true;
          for (let i = 0; i < this.totalPages; i++) {
            this.mypages[i] = { id: "name" };
          }
        }
      },
      error: (err) => {
        this.errorMessage = err.error.error;
      },
    });
  }

  // LOADING EXPENSES WITH DATE FILTER
  getListOfExpensesWithDate() {
    const filterLink =
      `&startDate=` +
      this.danValue +
      `&endDate=` +
      this.gachaValue +
      `&sort=` +
      this.sortField +
      `&order=` +
      this.sortDirection;

    return this.expenseService
      .getMyExpensesWithFilter(this.currentPage, filterLink)
      .subscribe({
        next: (res) => {
          this.expenseList = res.expenses;
          this.currentPage = res.currentPage;
          this.totalPages = res.totalPages;
          if (this.totalPages > 1) {
            this.needPagination = true;
            for (let i = 0; i < this.totalPages; i++) {
              this.mypages[i] = { id: "name" };
            }
          }
        },
        error: (err) => {
          this.errorMessage = err.error.error;
        },
      });
  }

  // LOAD EXPENSES WITH FILTER OF CATS, COMMENT AND ADMIN ID
  getListOfExpensesWIthFilter(
    comment: string,
    startDate: string,
    endDate: string,
    sortField: string,
    sortDirection: string
  ) {
    const filterLink =
      `&comment=` +
      comment +
      `&startDate=` +
      startDate +
      `&endDate=` +
      endDate +
      `&sort=` +
      sortField +
      `&order=` +
      sortDirection;

    return this.expenseService
      .getMyExpensesWithFilter(this.currentPage, filterLink)
      .subscribe({
        next: (res) => {
          this.expenseList = res.expenses;
          this.currentPage = res.currentPage;
          this.totalPages = res.totalPages;
          if (this.totalPages > 1) {
            this.needPagination = true;
            for (let i = 0; i < this.totalPages; i++) {
              this.mypages[i] = { id: "name" };
            }
          }
        },
        error: (err) => {
          this.errorMessage = err.error.error;
        },
      });
  }
}
