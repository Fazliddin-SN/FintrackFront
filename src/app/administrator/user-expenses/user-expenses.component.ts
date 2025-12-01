import { DatePipe } from "@angular/common";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { Sort } from "@angular/material/sort";
import { ExpenseService } from "src/app/services/expense.service";
import { CategoriesService } from "src/app/services/categories.service";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";

// Proper interface for Expense
interface Expense {
  id: number;
  uzs_cash: number;
  usd_cash: number;
  card: number;
  comment: string;
  admin_id: number;
  category_id: number;
  date: string;
  category?: {
    id: number;
    name: string;
  };
}

interface Category {
  id: number;
  name: string;
}

interface FilterState {
  category_id: string;
  comment: string;
  startDate: string;
  endDate: string;
  sortField: string;
  sortDirection: string;
}

@Component({
  selector: "app-user-expenses",
  templateUrl: "./user-expenses.component.html",
  styleUrls: ["./user-expenses.component.css"],
})
export class UserExpensesComponent implements OnInit, OnDestroy {
  // Data properties
  expenseList: Expense[] = [];
  expenseCats: Category[] = [];
  filteredExpenses: Expense[] = [];

  // UI state
  isLoading: boolean = false;
  showAdvancedFilters: boolean = false;
  errorMessage: string = "";

  // Pagination
  currentPage: number = 0;
  totalPages: number = 0;
  totalItems: number = 0;
  pageSize: number = 100;
  pages: number[] = [];

  // Filter state
  filters: FilterState = {
    category_id: "",
    comment: "",
    startDate: "",
    endDate: "",
    sortField: "",
    sortDirection: "",
  };

  // Table headers
  tableHeaders: string[] = [
    "№",
    "So'mda",
    "Dollarda",
    "Kartadan",
    "Izoh",
    "Kategoriya",
    "Sana",
  ];

  // User info
  roleId: string = "";

  // For unsubscribing
  private destroy$ = new Subject<void>();

  constructor(
    private datePipe: DatePipe,
    private expenseService: ExpenseService,
    private expenseCatService: CategoriesService
  ) {}

  ngOnInit(): void {
    this.roleId = localStorage.getItem("roleId") || "";
    this.loadInitialData();

    if (this.roleId != "1") {
      const el = document.querySelector(".toggle-filters-btn");
      if (el) {
        el.remove();
      }
      this.showAdvancedFilters = true;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Load all initial data
  loadInitialData(): void {
    this.loadExpenseCats();
    this.loadExpenses();
  }

  // LOAD EXPENSE CATEGORIES
  loadExpenseCats(): void {
    this.expenseCatService
      .getExCats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.expenseCats = res;
        },
        error: (err) => {
          console.error("Kategoriyalarni yuklashda xatolik:", err);
        },
      });
  }

  // LOAD MY EXPENSES
  loadExpenses(): void {
    this.isLoading = true;
    this.errorMessage = "";

    this.expenseService
      .getMyExpenses(this.currentPage)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.expenseList = res.expenses || [];
          this.totalPages = res.totalPages || 0;

          // Calculate totalItems if backend doesn't provide it
          this.totalItems = res.totalItems || this.totalPages * this.pageSize;

          this.updatePagination();
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.handleError("Ma'lumotlarni yuklashda xatolik", err);
        },
      });
  }

  // LOAD EXPENSES WITH FILTERS
  loadExpensesWithFilters(): void {
    this.isLoading = true;
    this.errorMessage = "";

    const queryParams = this.buildQueryParams();

    this.expenseService
      .getMyExpensesWithFilter(this.currentPage, queryParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.expenseList = res.expenses || [];
          this.filteredExpenses = res.expenses || [];
          this.totalPages = res.totalPages || 0;

          // Calculate totalItems if backend doesn't provide it
          this.totalItems = res.totalItems || this.totalPages * this.pageSize;

          this.updatePagination();
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.handleError("Filterlangan ma'lumotlarni yuklashda xatolik", err);
        },
      });
  }

  // BUILD QUERY PARAMS
  buildQueryParams(): string {
    const params: string[] = [];

    if (this.filters.category_id)
      params.push(`category_id=${this.filters.category_id}`);
    if (this.filters.comment) params.push(`comment=${this.filters.comment}`);
    if (this.filters.startDate)
      params.push(`startDate=${this.filters.startDate}`);
    if (this.filters.endDate) params.push(`endDate=${this.filters.endDate}`);
    if (this.filters.sortField) params.push(`sort=${this.filters.sortField}`);
    if (this.filters.sortDirection)
      params.push(`order=${this.filters.sortDirection}`);

    return params.length > 0 ? `&${params.join("&")}` : "";
  }

  // UPDATE PAGINATION
  updatePagination(): void {
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i);
  }

  // PAGINATION - GO TO PAGE
  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.scrollToTop();

    if (this.hasActiveFilters()) {
      this.loadExpensesWithFilters();
    } else {
      this.loadExpenses();
    }
  }

  // HANDLE PAGINATION CHANGE (Material Paginator)
  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.scrollToTop();

    if (this.hasActiveFilters()) {
      this.loadExpensesWithFilters();
    } else {
      this.loadExpenses();
    }
  }

  // CHECK IF FILTERS ARE ACTIVE
  hasActiveFilters(): boolean {
    return (
      !!this.filters.category_id ||
      !!this.filters.comment ||
      !!this.filters.startDate ||
      !!this.filters.endDate
    );
  }

  // APPLY FILTERS
  applyFilter(filterType: string, value: any): void {
    this.currentPage = 0; // Reset to first page

    switch (filterType) {
      case "category":
        this.filters.category_id = value;
        break;
      case "comment":
        this.filters.comment = value;
        break;
      case "startDate":
        this.filters.startDate = this.formatDate(value);
        break;
      case "endDate":
        this.filters.endDate = this.formatDate(value);
        break;
    }

    if (this.hasActiveFilters()) {
      this.loadExpensesWithFilters();
    } else {
      this.loadExpenses();
    }
  }

  // CLEAR ALL FILTERS
  clearFilters(): void {
    this.filters = {
      category_id: "",
      comment: "",
      startDate: "",
      endDate: "",
      sortField: "",
      sortDirection: "",
    };
    this.currentPage = 0;
    this.loadExpenses();
  }

  // SORTING
  sortData(sort: Sort): void {
    if (!sort.active || sort.direction === "") {
      this.filters.sortField = "";
      this.filters.sortDirection = "";
    } else {
      this.filters.sortField = sort.active;
      this.filters.sortDirection = sort.direction;
    }

    if (this.hasActiveFilters()) {
      this.loadExpensesWithFilters();
    } else {
      this.loadExpenses();
    }
  }

  // TOGGLE ADVANCED FILTERS
  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  // EXPORT TO EXCEL
  exportToExcel(): void {
    const dataToExport = this.filteredExpenses.length
      ? this.filteredExpenses
      : this.expenseList;

    if (!dataToExport.length) {
      alert("Export qilish uchun ma'lumot yo'q!");
      return;
    }

    const formattedData = dataToExport.map((exp, index) => ({
      "№": index + 1,
      "So'mda": this.formatCurrency(exp.uzs_cash),
      Dollarda: this.formatCurrency(exp.usd_cash),
      Kartadan: this.formatCurrency(exp.card),
      Izoh: exp.comment || "",
      Kategoriya: exp.category?.name || "",
      Sana: this.formatDateForExcel(exp.date),
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(formattedData);
    worksheet["!cols"] = [
      { wch: 5 }, // №
      { wch: 15 }, // So'mda
      { wch: 15 }, // Dollarda
      { wch: 15 }, // Kartadan
      { wch: 30 }, // Izoh
      { wch: 20 }, // Kategoriya
      { wch: 12 }, // Sana
    ];

    const workbook: XLSX.WorkBook = {
      Sheets: { "Mening Chiqimlarim": worksheet },
      SheetNames: ["Mening Chiqimlarim"],
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob: Blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const timestamp = this.datePipe.transform(new Date(), "yyyy-MM-dd");
    FileSaver.saveAs(blob, `Mening_Chiqimlarim_${timestamp}.xlsx`);
  }

  // HELPER: FORMAT DATE
  formatDate(date: any): string {
    if (!date) return "";
    return this.datePipe.transform(date, "yyyy-MM-dd") || "";
  }

  // HELPER: FORMAT DATE FOR EXCEL
  formatDateForExcel(date: any): string {
    if (!date) return "";
    return this.datePipe.transform(date, "d MMMM, y") || "";
  }

  // HELPER: FORMAT CURRENCY
  formatCurrency(value: number): string {
    if (!value) return "0";
    return value.toLocaleString("uz-UZ");
  }

  // HELPER: HANDLE ERRORS
  handleError(title: string, err: any): void {
    console.error(title, err);
    this.errorMessage = err.error?.error || err.message || "Noma'lum xatolik";
  }

  // HELPER: SCROLL TO TOP
  scrollToTop(): void {
    const element = document.getElementById("listcard");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // HELPER: GET TOTAL AMOUNT
  getTotalAmount(field: keyof Expense): number {
    return this.expenseList.reduce(
      (sum, expense) => sum + (Number(expense[field]) || 0),
      0
    );
  }
}
