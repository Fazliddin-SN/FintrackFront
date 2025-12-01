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
  selector: "app-suspicious-incomes",
  templateUrl: "./suspicious-incomes.component.html",
  styleUrls: ["./suspicious-incomes.component.css"],
})
export class SuspiciousIncomesComponent implements OnInit {
  incomesList: any[] = [];
  incomeCats: any[] = [];
  errorMessage: string = "";

  // UI State
  isLoading: boolean = false;
  showAdvancedFilters: boolean = false;

  // Pagination
  currentPage: number = 0;
  pageSize: number = 100;
  totalPages: number = 0;
  totalItems: number = 0;

  // Selected income for highlighting
  selectedIncomeId: any = null;

  // Filter state
  filters: FilterState = {
    category_id: "",
    comment: "",
    staff_id: "",
    startDate: "",
    endDate: "",
    sort: "",
    order: "",
  };

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
        this.errorMessage =
          err.error?.error || "Kategoriyalarni yuklashda xatolik";
        console.error("Error loading categories:", err);
      },
    });
  }

  /**
   * Load suspicious incomes (checked = 3)
   */
  loadIncomes(): void {
    this.isLoading = true;
    this.errorMessage = "";

    this.incomeService.getIncomes(this.currentPage).subscribe({
      next: (res) => {
        // Filter only suspicious incomes (checked = 3)
        this.incomesList = res.incomes.filter((inc) => +inc.checked === 3);

        this.currentPage = res.currentPage;
        this.totalPages = res.totalPages;
        this.totalItems = res.totalItems || this.incomesList.length;

        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage =
          err.error?.error || "Ma'lumotlarni yuklashda xatolik";
        console.error("Error loading incomes:", err);
        this.isLoading = false;
      },
    });
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
   * Clear all filters
   */
  clearFilters(): void {
    this.filters = {
      category_id: "",
      comment: "",
      staff_id: "",
      startDate: "",
      endDate: "",
      sort: "",
      order: "",
    };
    this.currentPage = 0;
    this.loadIncomes();
  }

  /**
   * Apply single filter
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

    this.currentPage = 0;
    this.loadIncomesWithFilter();
  }

  /**
   * Sort data
   */
  sortData(sort: Sort): void {
    if (!sort.active || sort.direction === "") {
      this.filters.sort = "";
      this.filters.order = "";
    } else {
      this.filters.sort = sort.active;
      this.filters.order = sort.direction;
    }

    this.loadIncomesWithFilter();
  }

  /**
   * Load incomes with current filters
   */
  loadIncomesWithFilter(): void {
    this.isLoading = true;
    this.errorMessage = "";

    const filterLink = this.buildFilterLink();

    this.incomeService
      .getIncomesWithFilter(this.currentPage, filterLink)
      .subscribe({
        next: (res) => {
          // Filter only suspicious incomes (checked = 3)
          this.incomesList = res.incomes.filter((inc) => +inc.checked === 3);

          this.currentPage = res.currentPage;
          this.totalPages = res.totalPages;
          this.totalItems = res.totalItems || this.incomesList.length;

          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage =
            err.error?.error || "Ma'lumotlarni yuklashda xatolik";
          console.error("Error loading incomes:", err);
          this.isLoading = false;
        },
      });
  }

  /**
   * Build filter link
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
   * Go to specific page
   */
  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;

    this.currentPage = page;

    if (this.hasActiveFilters()) {
      this.loadIncomesWithFilter();
    } else {
      this.loadIncomes();
    }

    // Scroll to top of table
    document.getElementById("listcard")?.scrollIntoView({ behavior: "smooth" });
  }

  /**
   * Format currency
   */
  formatCurrency(val: number): string {
    return val ? val.toLocaleString("uz-UZ") : "";
  }

  /**
   * Format date
   */
  formatDate(date: any): string {
    return this.datePipe.transform(date, "d MMMM, y") || "";
  }

  /**
   * Download Excel
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

    const exportData = this.incomesList.map((inc) => ({
      "So'mda": this.formatCurrency(+inc.uzs_cash) || 0,
      Dollarda: this.formatCurrency(+inc.usd_cash) || 0,
      Kartadan: this.formatCurrency(+inc.card) || 0,
      "Kompaniya Hisobiga": this.formatCurrency(+inc.account) || 0,
      "Mijoz IDsi": inc.userId || "",
      "Partiya Raqami": inc.part_num || "",
      "Admin ID": inc.admin_id || "",
      Izoh: inc.comment || "",
      Kategoriya: inc.category?.name || "",
      Sana: this.formatDate(inc.date),
    }));

    this.exportToExcel(exportData, "Shubhali-Kirimlar");
  }

  /**
   * Export to Excel
   */
  exportToExcel(data: any[], fileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);

    worksheet["!cols"] = [
      { wch: 15 }, // So'mda
      { wch: 15 }, // Dollarda
      { wch: 15 }, // Kartadan
      { wch: 20 }, // Hisobdan
      { wch: 12 }, // Mijoz ID
      { wch: 20 }, // Partiya
      { wch: 12 }, // Admin ID
      { wch: 30 }, // Izoh
      { wch: 20 }, // Kategoriya
      { wch: 18 }, // Sana
    ];

    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ["data"],
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob: Blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const timestamp = this.datePipe.transform(new Date(), "yyyy-MM-dd_HH-mm");
    const fullName = `${fileName}_${timestamp}.xlsx`;

    FileSaver.saveAs(blob, fullName);

    Swal.fire({
      icon: "success",
      title: "Muvaffaqiyatli!",
      text: "Excel fayli yuklab olindi",
      timer: 2000,
      showConfirmButton: false,
    });
  }

  /**
   * Mark income as SUCCESSFUL
   * Shows category and comment in confirmation dialog
   */
  succCheck(income: any): void {
    this.selectedIncomeId = income.id;

    const categoryName = income.category?.name || "—";
    const comment = income.comment || "—";

    Swal.fire({
      title: "Muvaffaqiyatli deb belgilash",
      html: `
        <div style="text-align: left; margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px;">
          <p style="margin: 8px 0; font-size: 15px;">
            <strong style="color: #495057;">📁 Kategoriya:</strong> 
            <span style="color: #2c3e50;">${categoryName}</span>
          </p>
          <p style="margin: 8px 0; font-size: 15px;">
            <strong style="color: #495057;">📝 Izoh:</strong> 
            <span style="color: #2c3e50;">${comment}</span>
          </p>
        </div>
        <p style="margin-top: 15px; font-size: 16px; color: #495057;">
          Rostdan ham ushbu Kirimni <strong style="color: #28a745;">muvaffaqiyatli</strong> deb tasdiqlaysizmi?
        </p>
      `,
      icon: "question",
      confirmButtonText: "Ha, Tasdiqlayman",
      showCancelButton: true,
      cancelButtonText: "Yo'q, Bekor Qilish",
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.incomeService.checkStatus(income.id, 2).subscribe({
          next: (res) => {
            Swal.fire({
              title: "Tasdiqlandi!",
              text: "Kirim muvaffaqiyatli deb belgilandi.",
              icon: "success",
              timer: 1500,
              showConfirmButton: false,
            });

            // Reload data
            this.selectedIncomeId = null;
            if (this.hasActiveFilters()) {
              this.loadIncomesWithFilter();
            } else {
              this.loadIncomes();
            }
          },
          error: (err) => {
            this.selectedIncomeId = null;
            Swal.fire({
              title: "Xatolik!",
              text: err.error?.error || "Noma'lum xatolik yuz berdi.",
              icon: "error",
            });
          },
        });
      } else {
        // User cancelled - remove highlight
        this.selectedIncomeId = null;
      }
    });
  }

  /**
   * Mark income as FAILED
   * Shows category and comment in confirmation dialog
   */
  failedCheck(income: any): void {
    this.selectedIncomeId = income.id;

    const categoryName = income.category?.name || "—";
    const comment = income.comment || "—";

    Swal.fire({
      title: "Muvaffaqiyatsiz deb belgilash",
      html: `
        <div style="text-align: left; margin: 20px 0; padding: 15px; background: #fff5f5; border-radius: 8px;">
          <p style="margin: 8px 0; font-size: 15px;">
            <strong style="color: #721c24;">📁 Kategoriya:</strong> 
            <span style="color: #721c24;">${categoryName}</span>
          </p>
          <p style="margin: 8px 0; font-size: 15px;">
            <strong style="color: #721c24;">📝 Izoh:</strong> 
            <span style="color: #721c24;">${comment}</span>
          </p>
        </div>
        <p style="margin-top: 15px; font-size: 16px; color: #495057;">
          Rostdan ham ushbu Kirimni <strong style="color: #dc3545;">muvaffaqiyatsiz</strong> deb tasdiqlaysizmi?
        </p>
      `,
      icon: "warning",
      confirmButtonText: "Ha, Tasdiqlayman",
      showCancelButton: true,
      cancelButtonText: "Yo'q, Bekor Qilish",
      customClass: {
        confirmButton: "btn btn-danger",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.incomeService.checkStatus(income.id, 4).subscribe({
          next: (res) => {
            Swal.fire({
              title: "Tasdiqlandi!",
              text: "Kirim muvaffaqiyatsiz deb belgilandi.",
              icon: "success",
              timer: 1500,
              showConfirmButton: false,
            });

            // Reload data
            this.selectedIncomeId = null;
            if (this.hasActiveFilters()) {
              this.loadIncomesWithFilter();
            } else {
              this.loadIncomes();
            }
          },
          error: (err) => {
            this.selectedIncomeId = null;
            Swal.fire({
              title: "Xatolik!",
              text: err.error?.error || "Noma'lum xatolik yuz berdi.",
              icon: "error",
            });
          },
        });
      } else {
        // User cancelled - remove highlight
        this.selectedIncomeId = null;
      }
    });
  }
}
