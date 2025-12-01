import { Component, inject, OnInit } from "@angular/core";

import Swal from "sweetalert2";
import * as $ from "jquery";
import { DatePipe } from "@angular/common";
import { Sort } from "@angular/material/sort";

import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";

import { IncomesService } from "src/app/services/incomes.service";
import { CategoriesService } from "src/app/services/categories.service";

declare interface TableData {
  headerRow: string[];
}

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
  selector: "app-new-incomes",
  templateUrl: "./new-incomes.component.html",
  styleUrls: ["./new-incomes.component.css"],
})
export class NewIncomesComponent implements OnInit {
  private incomeService = inject(IncomesService);
  private incomeCatService = inject(CategoriesService);

  incomesList: any[] = [];
  incomeCats: any[] = [];
  errorMessage: string = "";
  tableData1: TableData;

  // UI State
  isLoading: boolean = false;
  showAdvancedFilters: boolean = false;

  // Pagination
  currentPage: number = 0;
  pageSize: number = 100;
  totalPages: number = 0;
  totalItems: number = 0;
  needPagination: boolean = false;
  mypages: any[] = [];

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

  constructor(private datePipe: DatePipe) {}

  ngOnInit(): void {
    this.tableData1 = {
      headerRow: [
        "№/Jami",
        "So'mda",
        "Dollarda",
        "Kartadan",
        "Kompaniya hisobiga",
        "Admin IDsi",
        "Mijoz IDsi",
        "Partiya Raqami",
        "Izoh",
        "Kategoriyasi",
        "Sanasi",
        "Amallar",
      ],
    };

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
   * Load new incomes (checked = 1)
   */
  loadIncomes(): void {
    this.isLoading = true;
    this.errorMessage = "";

    this.incomeService.getIncomes(this.currentPage).subscribe({
      next: (res) => {
        // Filter only new incomes (checked = 1)
        this.incomesList = res.incomes.filter((inc) => +inc.checked === 1);

        this.currentPage = res.currentPage;
        this.totalPages = res.totalPages;
        this.totalItems = res.totalItems || this.incomesList.length;

        this.setupPagination();
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
   * Setup pagination
   */
  setupPagination(): void {
    if (this.totalPages > 1) {
      this.needPagination = true;
      this.mypages = [];
      for (let i = 0; i < this.totalPages; i++) {
        this.mypages.push({ id: i });
      }
    } else {
      this.needPagination = false;
    }
  }

  /**
   * Go to page
   */
  pagebyNum(page: number): void {
    this.currentPage = page;
    document.getElementById("listcard")?.scrollIntoView({ behavior: "smooth" });

    if (this.filters.startDate || this.filters.endDate) {
      this.getListOfIncomesWithDate();
    } else if (this.hasActiveFilters()) {
      this.applyFilters(
        this.filters.category_id,
        this.filters.comment,
        this.filters.staff_id
      );
    } else {
      this.loadIncomes();
    }
  }

  /**
   * Check if any filters are active
   */
  hasActiveFilters(): boolean {
    return !!(
      this.filters.category_id ||
      this.filters.comment ||
      this.filters.staff_id
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
   * Transform date values
   */
  fromFunction(event: any): void {
    this.filters.startDate =
      this.datePipe.transform(event.value, "yyyy-MM-dd") || "";
  }

  toFunction(event: any): void {
    this.filters.endDate =
      this.datePipe.transform(event.value, "yyyy-MM-dd") || "";
  }

  /**
   * Apply filters
   */
  applyFilters(category_id: string, comment: string, staff_id: string): void {
    this.filters.category_id = category_id;
    this.filters.comment = comment;
    this.filters.staff_id = staff_id;
    this.currentPage = 0;

    this.getListOfIncomesWIthFilter(
      category_id,
      comment,
      staff_id,
      this.filters.startDate,
      this.filters.endDate,
      this.filters.sort,
      this.filters.order
    );
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

    if (this.filters.startDate || this.filters.endDate) {
      this.getListOfIncomesWithDate();
    } else {
      this.getListOfIncomesWIthFilter(
        this.filters.category_id,
        this.filters.comment,
        this.filters.staff_id,
        this.filters.startDate,
        this.filters.endDate,
        this.filters.sort,
        this.filters.order
      );
    }
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

    if (this.filters.startDate || this.filters.endDate) {
      this.getListOfIncomesWithDate();
    } else {
      this.getListOfIncomesWIthFilter(
        this.filters.category_id,
        this.filters.comment,
        this.filters.staff_id,
        this.filters.startDate,
        this.filters.endDate,
        this.filters.sort,
        this.filters.order
      );
    }
  }

  /**
   * Get incomes with date filter
   */
  getListOfIncomesWithDate(): void {
    this.isLoading = true;
    this.errorMessage = "";

    const filterLink = this.buildFilterLink();

    this.incomeService
      .getIncomesWithFilter(this.currentPage, filterLink)
      .subscribe({
        next: (res) => {
          // Filter only new incomes (checked = 1)
          this.incomesList = res.incomes.filter((inc) => +inc.checked === 1);

          this.currentPage = res.currentPage;
          this.totalPages = res.totalPages;
          this.totalItems = res.totalItems || this.incomesList.length;

          this.setupPagination();
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
   * Get incomes with filter
   */
  getListOfIncomesWIthFilter(
    category_id: string,
    comment: string,
    staff_id: string,
    startDate: string,
    endDate: string,
    sortField: string,
    sortDirection: string
  ): void {
    this.isLoading = true;
    this.errorMessage = "";

    const filterLink = this.buildFilterLink();

    this.incomeService
      .getIncomesWithFilter(this.currentPage, filterLink)
      .subscribe({
        next: (res) => {
          // Filter only new incomes (checked = 1)
          this.incomesList = res.incomes.filter((inc) => +inc.checked === 1);

          this.currentPage = res.currentPage;
          this.totalPages = res.totalPages;
          this.totalItems = res.totalItems || this.incomesList.length;

          this.setupPagination();
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
  downlaodExcel(): void {
    if (this.incomesList.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Ma'lumot yo'q",
        text: "Export qilish uchun ma'lumot mavjud emas",
      });
      return;
    }

    const filteredData = this.incomesList.map((inc) => ({
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

    this.exportToExel(filteredData, "Yangi-Kirimlar");
  }

  /**
   * Export to Excel
   */
  exportToExel(data: any[], fileName: string): void {
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

    const exelBuffer: any = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob: Blob = new Blob([exelBuffer], {
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
            this.loadIncomes();
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
   * Mark income as SUSPICIOUS
   * Shows category and comment in confirmation dialog
   */
  susCheck(income: any): void {
    this.selectedIncomeId = income.id;

    const categoryName = income.category?.name || "—";
    const comment = income.comment || "—";

    Swal.fire({
      title: "Shubhali deb belgilash",
      html: `
        <div style="text-align: left; margin: 20px 0; padding: 15px; background: #fff3cd; border-radius: 8px;">
          <p style="margin: 8px 0; font-size: 15px;">
            <strong style="color: #856404;">📁 Kategoriya:</strong> 
            <span style="color: #856404;">${categoryName}</span>
          </p>
          <p style="margin: 8px 0; font-size: 15px;">
            <strong style="color: #856404;">📝 Izoh:</strong> 
            <span style="color: #856404;">${comment}</span>
          </p>
        </div>
        <p style="margin-top: 15px; font-size: 16px; color: #495057;">
          Rostdan ham ushbu Kirimni <strong style="color: #ffc107;">SHUBHALI</strong> deb tasdiqlaysizmi?
        </p>
      `,
      icon: "warning",
      confirmButtonText: "Ha, Saqlash",
      showCancelButton: true,
      cancelButtonText: "Yo'q, Bekor Qilish",
      customClass: {
        confirmButton: "btn btn-warning",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.incomeService.checkStatus(income.id, 3).subscribe({
          next: (res) => {
            Swal.fire({
              title: "Tasdiqlandi!",
              text: "Kirim SHUBHALI deb belgilandi.",
              icon: "success",
              timer: 1500,
              showConfirmButton: false,
            });

            // Reload data
            this.selectedIncomeId = null;
            this.loadIncomes();
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
