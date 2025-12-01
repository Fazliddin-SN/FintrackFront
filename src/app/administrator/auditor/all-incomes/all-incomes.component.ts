import { Component, OnInit } from "@angular/core";
import { DatePipe } from "@angular/common";
import { Sort } from "@angular/material/sort";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";

import { IncomesService } from "src/app/services/incomes.service";
import { CategoriesService } from "src/app/services/categories.service";

interface FilterState {
  category_id: string;
  comment: string;
  staff_id: string;
  startDate: string;
  endDate: string;
  sort: string;
  order: string;
}

@Component({
  selector: "app-all-incomes",
  templateUrl: "./all-incomes.component.html",
  styleUrls: ["./all-incomes.component.css"],
})
export class AllIncomesComponent implements OnInit {
  // Data
  incomesList: any[] = [];
  incomeCats: any[] = [];

  // UI State
  isLoading: boolean = false;
  errorMessage: string = "";
  showAdvancedFilters: boolean = false;

  // Pagination
  currentPage: number = 0;
  pageSize: number = 100;
  totalItems: number = 0;
  totalPages: number = 0;
  pages: number[] = [];

  // Filters - Single source of truth
  filters: FilterState = {
    category_id: "",
    comment: "",
    staff_id: "",
    startDate: "",
    endDate: "",
    sort: "id",
    order: "desc",
  };

  // Table columns
  displayedColumns: string[] = [
    "index",
    "uzs_cash",
    "usd_cash",
    "card",
    "account",
    "admin_id",
    "userId",
    "part_num",
    "comment",
    "category",
    "status",
    "date",
  ];

  columnHeaders: { [key: string]: string } = {
    index: "№",
    uzs_cash: "So'mda",
    usd_cash: "Dollarda",
    card: "Kartadan",
    account: "Kompaniya hisobiga",
    admin_id: "Admin IDsi",
    userId: "Mijoz IDsi",
    part_num: "Partiya",
    comment: "Izoh",
    category: "Kategoriya",
    status: "Holat",
    date: "Sana",
  };

  // Expose Math for template
  Math = Math;

  constructor(
    private incomeService: IncomesService,
    private incomeCatService: CategoriesService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.loadIncomeCats();
    this.loadIncomes();
  }

  /**
   * Load income categories
   */
  loadIncomeCats(): void {
    this.incomeCatService.getInCats().subscribe({
      next: (res) => {
        this.incomeCats = res;
      },
      error: (err) => {
        console.error("Error loading categories:", err);
        this.errorMessage = "Kategoriyalarni yuklashda xatolik";
      },
    });
  }

  /**
   * Main function to load incomes with current filter state
   */
  loadIncomes(): void {
    this.isLoading = true;
    this.errorMessage = "";

    const filterLink = this.buildFilterLink();

    this.incomeService
      .getIncomesWithFilter(this.currentPage, filterLink)
      .subscribe({
        next: (res) => {
          this.incomesList = res.incomes || [];
          this.currentPage = res.currentPage || 0;
          this.totalItems = res.totalItems || 0;
          this.totalPages = res.totalPages || 0;
          this.generatePageNumbers();
          this.isLoading = false;
        },
        error: (err) => {
          console.error("Error loading incomes:", err);
          this.errorMessage =
            "Ma'lumotlarni yuklashda xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.";
          this.isLoading = false;
        },
      });
  }

  /**
   * Build filter link from current filter state
   */
  buildFilterLink(): string {
    const params: string[] = [];

    if (this.filters.category_id) {
      params.push(`category_id=${this.filters.category_id}`);
    }
    if (this.filters.comment) {
      params.push(`comment=${encodeURIComponent(this.filters.comment)}`);
    }
    if (this.filters.staff_id) {
      params.push(`staff_id=${this.filters.staff_id}`);
    }
    if (this.filters.startDate) {
      params.push(`startDate=${this.filters.startDate}`);
    }
    if (this.filters.endDate) {
      params.push(`endDate=${this.filters.endDate}`);
    }
    if (this.filters.sort) {
      params.push(`sort=${this.filters.sort}`);
    }
    if (this.filters.order) {
      params.push(`order=${this.filters.order}`);
    }

    return params.length > 0 ? "&" + params.join("&") : "";
  }

  /**
   * Apply filter - update state and reload
   */
  applyFilter(filterType: string, value: any): void {
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
        this.filters.startDate = value
          ? this.datePipe.transform(value, "yyyy-MM-dd")
          : "";
        break;
      case "endDate":
        this.filters.endDate = value
          ? this.datePipe.transform(value, "yyyy-MM-dd")
          : "";
        break;
    }

    this.currentPage = 0; // Reset to first page
    this.loadIncomes();
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.filters = {
      category_id: "",
      comment: "",
      staff_id: "",
      startDate: "",
      endDate: "",
      sort: "id",
      order: "desc",
    };
    this.currentPage = 0;
    this.loadIncomes();
  }

  /**
   * Check if any filters are active
   */
  hasActiveFilters(): boolean {
    return !!(
      this.filters.category_id ||
      this.filters.comment ||
      this.filters.staff_id ||
      this.filters.startDate ||
      this.filters.endDate
    );
  }

  /**
   * Toggle advanced filters visibility
   */
  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  /**
   * Sort data
   */
  sortData(sort: Sort): void {
    if (!sort.active || sort.direction === "") {
      this.filters.sort = "id";
      this.filters.order = "desc";
    } else {
      this.filters.sort = sort.active;
      this.filters.order = sort.direction;
    }

    this.loadIncomes();
  }

  /**
   * Go to specific page
   */
  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;

    this.currentPage = page;
    this.loadIncomes();

    // Scroll to top of table
    document.getElementById("listcard")?.scrollIntoView({ behavior: "smooth" });
  }

  /**
   * Generate page numbers for pagination
   */
  generatePageNumbers(): void {
    this.pages = [];

    // Show max 5 pages at a time
    const maxPages = 5;
    let startPage = Math.max(0, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPages);

    // Adjust start if we're near the end
    if (endPage - startPage < maxPages) {
      startPage = Math.max(0, endPage - maxPages);
    }

    for (let i = startPage; i < endPage; i++) {
      this.pages.push(i);
    }
  }

  /**
   * Export to Excel
   */
  downloadExcel(): void {
    if (this.incomesList.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Ma'lumot yo'q",
        text: "Export qilish uchun ma'lumot mavjud emas",
      });
      return;
    }

    // Show loading
    Swal.fire({
      title: "Excel fayli tayyorlanmoqda...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const exportData = this.incomesList.map((income, index) => ({
        "№": index + 1,
        "So'mda": this.formatCurrency(income.uzs_cash),
        Dollarda: this.formatCurrency(income.usd_cash),
        Kartadan: this.formatCurrency(income.card),
        "Kompaniya Hisobiga": this.formatCurrency(income.account),
        "Admin IDsi": income.admin_id || "",
        "Mijoz IDsi": income.userId || "",
        "Partiya Raqami": income.part_num || "",
        Izoh: income.comment || "",
        Kategoriya: income.category?.name || "",
        Holat: income.checkedStatus?.name || "",
        Sana: this.datePipe.transform(income.date, "dd.MM.yyyy HH:mm"),
      }));

      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      worksheet["!cols"] = [
        { wch: 5 }, // №
        { wch: 15 }, // So'mda
        { wch: 15 }, // Dollarda
        { wch: 15 }, // Kartadan
        { wch: 20 }, // Kompaniya Hisobiga
        { wch: 12 }, // Admin IDsi
        { wch: 12 }, // Mijoz IDsi
        { wch: 15 }, // Partiya
        { wch: 30 }, // Izoh
        { wch: 15 }, // Kategoriya
        { wch: 15 }, // Holat
        { wch: 18 }, // Sana
      ];

      const workbook: XLSX.WorkBook = {
        Sheets: { Kirimlar: worksheet },
        SheetNames: ["Kirimlar"],
      };

      const excelBuffer: any = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const blob: Blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const timestamp = this.datePipe.transform(new Date(), "yyyy-MM-dd_HH-mm");
      const fileName = `Kirimlar_${timestamp}.xlsx`;

      FileSaver.saveAs(blob, fileName);

      Swal.fire({
        icon: "success",
        title: "Muvaffaqiyatli!",
        text: "Excel fayli yuklab olindi",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Excel export error:", error);
      Swal.fire({
        icon: "error",
        title: "Xatolik!",
        text: "Excel faylini yaratishda xatolik yuz berdi",
      });
    }
  }

  /**
   * Format currency for display
   */
  formatCurrency(value: any): string {
    const num = parseFloat(value);
    if (!num || num === 0) return "—";
    return num.toLocaleString("uz-UZ", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  /**
   * Get status class for row
   */
  getStatusClass(income: any): string {
    const status = income.checkedStatus?.name;
    switch (status) {
      case "successful":
        return "status-success";
      case "failed":
        return "status-failed";
      case "suspicious":
        return "status-suspicious";
      case "notChecked":
        return "status-not-checked";
      default:
        return "";
    }
  }

  /**
   * Toggle sort direction for simple table headers
   */
  toggleSort(): string {
    return this.filters.order === "asc" ? "desc" : "asc";
  }

  /**
   * Get status label
   */
  getStatusLabel(income: any): string {
    const status = income.checkedStatus?.name;
    switch (status) {
      case "successful":
        return "Muvaffaqiyatli";
      case "failed":
        return "Muvaffaqiyatsiz";
      case "suspicious":
        return "Shubhali";
      case "notChecked":
        return "Tekshirilmagan";
      default:
        return "—";
    }
  }
}
