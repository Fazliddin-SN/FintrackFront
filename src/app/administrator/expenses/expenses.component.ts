import { DatePipe } from "@angular/common";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { Sort } from "@angular/material/sort";
import { AuthService } from "src/app/services/auth.service";
import { CategoriesService } from "src/app/services/categories.service";
import { ExpenseService } from "src/app/services/expense.service";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";

// Proper interface for Expense
interface Expense {
  id: number;
  uzs_cash: number;
  usd_cash: number;
  card: number;
  account: number;
  comment: string;
  admin_id: number;
  staff_id: number;
  category_id: number;
  date: string;
  category?: {
    id: number;
    name: string;
  };
  employee?: {
    id: number;
    username: string;
  };
}

interface Category {
  id: number;
  name: string;
}

interface User {
  id: number;
  username: string;
}

interface FilterState {
  category_id: string;
  comment: string;
  staff_id: string;
  startDate: string;
  endDate: string;
  sortField: string;
  sortDirection: string;
}

@Component({
  selector: "app-expenses",
  templateUrl: "./expenses.component.html",
  styleUrls: ["./expenses.component.css"],
})
export class ExpensesComponent implements OnInit, OnDestroy {
  // Data properties
  expenseList: Expense[] = [];
  usersList: User[] = [];
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
    staff_id: "",
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
    "Hisobdan",
    "Izoh",
    "Xodim",
    "Kategoriya",
    "Sana",
    "Amallar",
  ];

  // User info
  adminId: string = "";

  // For unsubscribing
  private destroy$ = new Subject<void>();

  constructor(
    private datePipe: DatePipe,
    private expenseService: ExpenseService,
    private expenseCatService: CategoriesService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.adminId = localStorage.getItem("userId") || "";
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Load all initial data
  loadInitialData(): void {
    this.loadExpenseCats();
    this.loadUsers();
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
          this.handleError("Kategoriyalarni yuklashda xatolik", err);
        },
      });
  }

  // LOAD USERS LIST
  loadUsers(): void {
    this.authService
      .loadUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.usersList = res;
        },
        error: (err) => {
          this.handleError("Foydalanuvchilarni yuklashda xatolik", err);
        },
      });
  }

  // LOAD EXPENSES
  loadExpenses(): void {
    this.isLoading = true;
    this.errorMessage = "";

    this.expenseService
      .getExpenses(this.currentPage)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.expenseList = res.expenses || [];
          this.currentPage = res.currentPage || 0;
          this.totalPages = res.totalPages || 0;
          this.totalItems = res.totalItems || 0;
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
      .getExpensesWithFilter(this.currentPage, queryParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.expenseList = res.expenses || [];
          this.filteredExpenses = res.expenses || [];
          this.currentPage = res.currentPage || 0;
          this.totalPages = res.totalPages || 0;
          this.totalItems = res.totalItems || 0;
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
    if (this.filters.staff_id) params.push(`staff_id=${this.filters.staff_id}`);
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

  // CHECK IF FILTERS ARE ACTIVE
  hasActiveFilters(): boolean {
    return (
      !!this.filters.category_id ||
      !!this.filters.comment ||
      !!this.filters.staff_id ||
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
      case "staff":
        this.filters.staff_id = value;
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
      staff_id: "",
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

  // ADD NEW EXPENSE
  async addExpense(): Promise<void> {
    const categoryOptions = this.expenseCats
      .map((cat) => `<option value="${cat.id}">${cat.name}</option>`)
      .join("");

    const userOptions = this.usersList
      .map((user) => `<option value="${user.id}">${user.username}</option>`)
      .join("");

    const result = await Swal.fire({
      title: "Yangi Chiqim Qo'shish",
      html: `
        <div style="text-align: left;">
          <div class="form-group mb-3">
            <label class="form-label">Naqd So'mda</label>
            <input id="input-uzs" type="number" class="form-control" placeholder="0" />
          </div>
          
          <div class="form-group mb-3">
            <label class="form-label">Naqd Dollarda</label>
            <input id="input-usd" type="number" class="form-control" placeholder="0" />
          </div>
          
          <div class="form-group mb-3">
            <label class="form-label">Kartadan</label>
            <input id="input-card" type="number" class="form-control" placeholder="0" />
          </div>
          
          <div class="form-group mb-3">
            <label class="form-label">Kompaniya Hisobidan</label>
            <input id="input-account" type="number" class="form-control" placeholder="0" />
          </div>
          
          <div class="form-group mb-3">
            <label class="form-label">Xodim *</label>
            <select id="swal-staffId" class="form-control">
              <option value="" disabled selected>Tanlang</option>
              ${userOptions}
            </select>
          </div>
          
          <div class="form-group mb-3">
            <label class="form-label">Kategoriya *</label>
            <select id="swal-catId" class="form-control">
              <option value="" disabled selected>Tanlang</option>
              ${categoryOptions}
            </select>
          </div>
          
          <div class="form-group mb-3">
            <label class="form-label">Izoh</label>
            <textarea id="input-comment" class="form-control" rows="2" placeholder="Izoh yozing..."></textarea>
          </div>
        </div>
      `,
      width: "600px",
      showCancelButton: true,
      confirmButtonText: "Saqlash",
      cancelButtonText: "Bekor Qilish",
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false,
      preConfirm: () => {
        const uzs_cash = Number(
          (document.getElementById("input-uzs") as HTMLInputElement).value
        );
        const usd_cash = Number(
          (document.getElementById("input-usd") as HTMLInputElement).value
        );
        const card = Number(
          (document.getElementById("input-card") as HTMLInputElement).value
        );
        const account = Number(
          (document.getElementById("input-account") as HTMLInputElement).value
        );
        const staff_id = Number(
          (document.getElementById("swal-staffId") as HTMLSelectElement).value
        );
        const category_id = Number(
          (document.getElementById("swal-catId") as HTMLSelectElement).value
        );
        const comment = (
          document.getElementById("input-comment") as HTMLTextAreaElement
        ).value;

        if (!category_id || !staff_id) {
          Swal.showValidationMessage("Kategoriya va Xodim tanlanishi kerak!");
          return false;
        }

        return {
          uzs_cash,
          usd_cash,
          card,
          account,
          admin_id: Number(this.adminId),
          staff_id,
          category_id,
          comment,
          date: new Date().toISOString(),
        };
      },
    });

    if (result.isConfirmed && result.value) {
      Swal.fire({
        title: "Saqlanmoqda...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      this.expenseService
        .addExpense(result.value)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadExpenses();
            Swal.fire("Muvaffaqiyat!", "Yangi chiqim qo'shildi!", "success");
          },
          error: (err) => {
            Swal.fire("Xatolik", err.error?.error || err.message, "error");
          },
        });
    }
  }

  // EDIT EXPENSE
  async editExpense(expense: Expense): Promise<void> {
    const categoryOptions = this.expenseCats
      .map(
        (cat) =>
          `<option value="${cat.id}" ${
            cat.id === expense.category_id ? "selected" : ""
          }>${cat.name}</option>`
      )
      .join("");

    const userOptions = this.usersList
      .map(
        (user) =>
          `<option value="${user.id}" ${
            user.id === expense.staff_id ? "selected" : ""
          }>${user.username}</option>`
      )
      .join("");

    const result = await Swal.fire({
      title: "Chiqimni Tahrirlash",
      html: `
        <div style="text-align: left;">
          <div class="form-group mb-3">
            <label class="form-label">Naqd So'mda</label>
            <input id="input-uzs" type="number" class="form-control" value="${
              expense.uzs_cash || 0
            }" />
          </div>
          
          <div class="form-group mb-3">
            <label class="form-label">Naqd Dollarda</label>
            <input id="input-usd" type="number" class="form-control" value="${
              expense.usd_cash || 0
            }" />
          </div>
          
          <div class="form-group mb-3">
            <label class="form-label">Kartadan</label>
            <input id="input-card" type="number" class="form-control" value="${
              expense.card || 0
            }" />
          </div>
          
          <div class="form-group mb-3">
            <label class="form-label">Kompaniya Hisobidan</label>
            <input id="input-account" type="number" class="form-control" value="${
              expense.account || 0
            }" />
          </div>
          
          <div class="form-group mb-3">
            <label class="form-label">Sana *</label>
            <input id="input-date" type="date" class="form-control" value="${
              expense.date ? expense.date.split("T")[0] : ""
            }" />
          </div>
          
          <div class="form-group mb-3">
            <label class="form-label">Xodim *</label>
            <select id="swal-staffId" class="form-control">
              <option value="" disabled>Tanlang</option>
              ${userOptions}
            </select>
          </div>
          
          <div class="form-group mb-3">
            <label class="form-label">Kategoriya *</label>
            <select id="swal-catId" class="form-control">
              <option value="" disabled>Tanlang</option>
              ${categoryOptions}
            </select>
          </div>
          
          <div class="form-group mb-3">
            <label class="form-label">Izoh</label>
            <textarea id="input-comment" class="form-control" rows="2">${
              expense.comment || ""
            }</textarea>
          </div>
        </div>
      `,
      width: "600px",
      showCancelButton: true,
      confirmButtonText: "Saqlash",
      cancelButtonText: "Bekor Qilish",
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false,
      preConfirm: () => {
        const uzs_cash = Number(
          (document.getElementById("input-uzs") as HTMLInputElement).value
        );
        const usd_cash = Number(
          (document.getElementById("input-usd") as HTMLInputElement).value
        );
        const card = Number(
          (document.getElementById("input-card") as HTMLInputElement).value
        );
        const account = Number(
          (document.getElementById("input-account") as HTMLInputElement).value
        );
        const date = (document.getElementById("input-date") as HTMLInputElement)
          .value;
        const staff_id = Number(
          (document.getElementById("swal-staffId") as HTMLSelectElement).value
        );
        const category_id = Number(
          (document.getElementById("swal-catId") as HTMLSelectElement).value
        );
        const comment = (
          document.getElementById("input-comment") as HTMLTextAreaElement
        ).value;

        if (!category_id || !staff_id || !date) {
          Swal.showValidationMessage(
            "Kategoriya, Xodim va Sana kiritilishi kerak!"
          );
          return false;
        }

        return {
          uzs_cash,
          usd_cash,
          card,
          account,
          date,
          staff_id,
          category_id,
          comment,
        };
      },
    });

    if (result.isConfirmed && result.value) {
      Swal.fire({
        title: "Saqlanmoqda...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      this.expenseService
        .editExpense(expense.id, result.value)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadExpenses();
            Swal.fire("Muvaffaqiyat!", "Chiqim tahrirlandi!", "success");
          },
          error: (err) => {
            Swal.fire("Xatolik", err.error?.error || err.message, "error");
          },
        });
    }
  }

  // DELETE EXPENSE
  async deleteExpense(id: number): Promise<void> {
    const confirmResult = await Swal.fire({
      title: "Rostan ham o'chirmoqchimisiz?",
      text: "Bu amalni qaytarib bo'lmaydi!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ha, o'chirish",
      cancelButtonText: "Bekor qilish",
      customClass: {
        confirmButton: "btn btn-danger",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
    });

    if (confirmResult.isConfirmed) {
      Swal.fire({
        title: "O'chirilmoqda...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      this.expenseService
        .deleteExpense(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadExpenses();
            Swal.fire("O'chirildi!", "Chiqim o'chirildi!", "success");
          },
          error: (err) => {
            Swal.fire("Xatolik", err.error?.error || err.message, "error");
          },
        });
    }
  }

  // EXPORT TO EXCEL
  exportToExcel(): void {
    const dataToExport = this.filteredExpenses.length
      ? this.filteredExpenses
      : this.expenseList;

    if (!dataToExport.length) {
      Swal.fire("Xatolik", "Export qilish uchun ma'lumot yo'q!", "warning");
      return;
    }

    const formattedData = dataToExport.map((exp, index) => ({
      "№": index + 1,
      "So'mda": this.formatCurrency(exp.uzs_cash),
      Dollarda: this.formatCurrency(exp.usd_cash),
      Kartadan: this.formatCurrency(exp.card),
      Hisobdan: this.formatCurrency(exp.account),
      Izoh: exp.comment || "",
      Xodim: exp.employee?.username || "",
      Kategoriya: exp.category?.name || "",
      Sana: this.formatDate(exp.date),
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(formattedData);
    worksheet["!cols"] = [
      { wch: 5 }, // №
      { wch: 15 }, // So'mda
      { wch: 15 }, // Dollarda
      { wch: 15 }, // Kartadan
      { wch: 15 }, // Hisobdan
      { wch: 30 }, // Izoh
      { wch: 20 }, // Xodim
      { wch: 20 }, // Kategoriya
      { wch: 12 }, // Sana
    ];

    const workbook: XLSX.WorkBook = {
      Sheets: { Chiqimlar: worksheet },
      SheetNames: ["Chiqimlar"],
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob: Blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const timestamp = this.datePipe.transform(new Date(), "yyyy-MM-dd");
    FileSaver.saveAs(blob, `Chiqimlar_${timestamp}.xlsx`);
  }

  // HELPER: FORMAT DATE
  formatDate(date: any): string {
    if (!date) return "";
    return this.datePipe.transform(date, "yyyy-MM-dd") || "";
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
    Swal.fire("Xatolik", this.errorMessage, "error");
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
