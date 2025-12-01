import { Component, OnInit, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort, Sort } from "@angular/material/sort";
import { DailyIncomeOverallService } from "src/app/services/daily-income-overall.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-daily-income-overall",
  templateUrl: "./daily-income-overall.component.html",
  styleUrls: ["./daily-income-overall.component.css"],
})
export class DailyIncomeOverallComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Data
  dailyIncomeList: any[] = [];
  todayEntry: any = null;

  // Pagination
  totalItems: number = 0;
  totalPages: number = 0;
  currentPage: number = 0;
  pageSize: number = 30;

  // UI State
  isLoading: boolean = false;
  errorMessage: string = "";
  showAdvancedFilters: boolean = false;

  // Filters
  filters = {
    startDate: null,
    endDate: null,
    comment: "",
  };

  // Sorting
  sortField: string = "createdAt";
  sortOrder: string = "desc";

  constructor(private dailyIncomeService: DailyIncomeOverallService) {}

  ngOnInit(): void {
    this.loadDailyIncomes();
    this.loadTodayEntry();
  }

  /**
   * Load all daily income overall records
   */
  loadDailyIncomes(): void {
    this.isLoading = true;
    this.errorMessage = "";

    const filterLink = this.buildFilterLink();

    this.dailyIncomeService
      .getDailyIncomeOverall(this.currentPage, filterLink)
      .subscribe({
        next: (response) => {
          this.dailyIncomeList = response.data || [];
          this.totalItems = response.totalItems || 0;
          this.totalPages = response.totalPages || 0;
          this.currentPage = response.currentPage || 0;
          this.isLoading = false;
        },
        error: (error) => {
          console.error("Error loading daily incomes:", error);
          this.errorMessage =
            "Ma'lumotlarni yuklashda xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.";
          this.isLoading = false;
        },
      });
  }

  /**
   * Load today's entry to check if it exists
   */
  loadTodayEntry(): void {
    this.dailyIncomeService.getTodayDailyIncomeOverall().subscribe({
      next: (response) => {
        this.todayEntry = response.data;
      },
      error: (error) => {
        // 404 means no entry for today - that's okay
        if (error.status === 404) {
          this.todayEntry = null;
        }
      },
    });
  }

  /**
   * Build filter link for API request
   */
  buildFilterLink(): string {
    let filterLink = "";

    if (this.filters.startDate) {
      filterLink += `&startDate=${this.filters.startDate}`;
    }

    if (this.filters.endDate) {
      filterLink += `&endDate=${this.filters.endDate}`;
    }

    if (this.filters.comment) {
      filterLink += `&comment=${encodeURIComponent(this.filters.comment)}`;
    }

    // Add sorting
    filterLink += `&sort=${this.sortField}&order=${this.sortOrder}`;

    return filterLink;
  }

  /**
   * Apply filter
   */
  applyFilter(filterType: string, value: any): void {
    switch (filterType) {
      case "comment":
        this.filters.comment = value;
        break;
      case "startDate":
        this.filters.startDate = value ? new Date(value).toISOString() : null;
        break;
      case "endDate":
        this.filters.endDate = value ? new Date(value).toISOString() : null;
        break;
    }

    this.currentPage = 0;
    this.loadDailyIncomes();
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.filters = {
      startDate: null,
      endDate: null,
      comment: "",
    };
    this.currentPage = 0;
    this.loadDailyIncomes();
  }

  /**
   * Check if any filters are active
   */
  hasActiveFilters(): boolean {
    return !!(
      this.filters.startDate ||
      this.filters.endDate ||
      this.filters.comment
    );
  }

  /**
   * Toggle advanced filters
   */
  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  /**
   * Sort data
   */
  sortData(sort: Sort): void {
    this.sortField = sort.active || "createdAt";
    this.sortOrder = sort.direction || "desc";
    this.loadDailyIncomes();
  }

  /**
   * Go to page
   */
  goToPage(page: number): void {
    this.currentPage = page;
    this.loadDailyIncomes();
  }

  /**
   * Add new daily income overall
   */
  addDailyIncome(): void {
    // Check if today's entry already exists
    if (this.todayEntry) {
      Swal.fire({
        title: "Bugun uchun yozuv mavjud",
        text: "Bugun uchun kirim yozuvi allaqachon mavjud. Uni tahrirlashni xohlaysizmi?",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Tahrirlash",
        cancelButtonText: "Bekor qilish",
      }).then((result) => {
        if (result.isConfirmed) {
          this.editDailyIncome(this.todayEntry);
        }
      });
      return;
    }

    Swal.fire({
      title: "Kunlik Umumiy Kirim Qo'shish",
      html: `
        <div class="form-group">
          <label class="form-label">So'mda naqd *</label>
          <input type="number" id="uzs_cash" class="form-control" placeholder="0" min="0" step="0.01">
        </div>
        <div class="form-group">
          <label class="form-label">Dollarda naqd *</label>
          <input type="number" id="usd_cash" class="form-control" placeholder="0" min="0" step="0.01">
        </div>
        <div class="form-group">
          <label class="form-label">Kartadan *</label>
          <input type="number" id="card" class="form-control" placeholder="0" min="0" step="0.01">
        </div>
        <div class="form-group">
          <label class="form-label">Hisobdan *</label>
          <input type="number" id="account" class="form-control" placeholder="0" min="0" step="0.01">
        </div>
        <div class="form-group">
          <label class="form-label">Izoh</label>
          <textarea id="comment" class="form-control" rows="3" placeholder="Izoh..."></textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Saqlash",
      cancelButtonText: "Bekor qilish",
      preConfirm: () => {
        const uzs_cash =
          parseFloat(
            (document.getElementById("uzs_cash") as HTMLInputElement).value
          ) || 0;
        const usd_cash =
          parseFloat(
            (document.getElementById("usd_cash") as HTMLInputElement).value
          ) || 0;
        const card =
          parseFloat(
            (document.getElementById("card") as HTMLInputElement).value
          ) || 0;
        const account =
          parseFloat(
            (document.getElementById("account") as HTMLInputElement).value
          ) || 0;
        const comment = (
          document.getElementById("comment") as HTMLTextAreaElement
        ).value;

        // Validation
        if (uzs_cash < 0 || usd_cash < 0 || card < 0 || account < 0) {
          Swal.showValidationMessage("Qiymatlar manfiy bo'lishi mumkin emas");
          return false;
        }

        if (uzs_cash === 0 && usd_cash === 0 && card === 0 && account === 0) {
          Swal.showValidationMessage(
            "Kamida bitta to'lov turida qiymat kiriting"
          );
          return false;
        }

        return {
          uzs_cash,
          usd_cash,
          card,
          account,
          comment,
        };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.dailyIncomeService
          .createDailyIncomeOverall(result.value)
          .subscribe({
            next: (response) => {
              Swal.fire({
                icon: "success",
                title: "Muvaffaqiyatli!",
                text: "Kunlik umumiy kirim qo'shildi",
                timer: 2000,
                showConfirmButton: false,
              });
              this.loadDailyIncomes();
              this.loadTodayEntry();
            },
            error: (error) => {
              console.error("Error creating daily income:", error);
              Swal.fire({
                icon: "error",
                title: "Xatolik!",
                text:
                  error.error?.error ||
                  "Kunlik kirimni qo'shishda xatolik yuz berdi",
              });
            },
          });
      }
    });
  }

  /**
   * Edit daily income overall
   */
  editDailyIncome(income: any): void {
    // Check if can be edited
    if (!income.canBeEdited) {
      Swal.fire({
        icon: "warning",
        title: "Tahrirlab bo'lmaydi",
        text: "Bu yozuvni faqat yaratilgan kuni tahrirlash mumkin",
      });
      return;
    }

    Swal.fire({
      title: "Kunlik Umumiy Kirimni Tahrirlash",
      html: `
        <div class="form-group">
          <label class="form-label">So'mda naqd *</label>
          <input type="number" id="uzs_cash" class="form-control" value="${
            income.uzs_cash
          }" min="0" step="0.01">
        </div>
        <div class="form-group">
          <label class="form-label">Dollarda naqd *</label>
          <input type="number" id="usd_cash" class="form-control" value="${
            income.usd_cash
          }" min="0" step="0.01">
        </div>
        <div class="form-group">
          <label class="form-label">Kartadan *</label>
          <input type="number" id="card" class="form-control" value="${
            income.card
          }" min="0" step="0.01">
        </div>
        <div class="form-group">
          <label class="form-label">Hisobdan *</label>
          <input type="number" id="account" class="form-control" value="${
            income.account
          }" min="0" step="0.01">
        </div>
        <div class="form-group">
          <label class="form-label">Izoh</label>
          <textarea id="comment" class="form-control" rows="3">${
            income.comment || ""
          }</textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Yangilash",
      cancelButtonText: "Bekor qilish",
      preConfirm: () => {
        const uzs_cash =
          parseFloat(
            (document.getElementById("uzs_cash") as HTMLInputElement).value
          ) || 0;
        const usd_cash =
          parseFloat(
            (document.getElementById("usd_cash") as HTMLInputElement).value
          ) || 0;
        const card =
          parseFloat(
            (document.getElementById("card") as HTMLInputElement).value
          ) || 0;
        const account =
          parseFloat(
            (document.getElementById("account") as HTMLInputElement).value
          ) || 0;
        const comment = (
          document.getElementById("comment") as HTMLTextAreaElement
        ).value;

        // Validation
        if (uzs_cash < 0 || usd_cash < 0 || card < 0 || account < 0) {
          Swal.showValidationMessage("Qiymatlar manfiy bo'lishi mumkin emas");
          return false;
        }

        if (uzs_cash === 0 && usd_cash === 0 && card === 0 && account === 0) {
          Swal.showValidationMessage(
            "Kamida bitta to'lov turida qiymat kiriting"
          );
          return false;
        }

        return {
          uzs_cash,
          usd_cash,
          card,
          account,
          comment,
        };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.dailyIncomeService
          .updateDailyIncomeOverall(income.id, result.value)
          .subscribe({
            next: (response) => {
              Swal.fire({
                icon: "success",
                title: "Muvaffaqiyatli!",
                text: "Kunlik umumiy kirim yangilandi",
                timer: 2000,
                showConfirmButton: false,
              });
              this.loadDailyIncomes();
              this.loadTodayEntry();
            },
            error: (error) => {
              console.error("Error updating daily income:", error);
              Swal.fire({
                icon: "error",
                title: "Xatolik!",
                text:
                  error.error?.error ||
                  "Kunlik kirimni yangilashda xatolik yuz berdi",
              });
            },
          });
      }
    });
  }

  /**
   * Delete daily income overall
   */
  deleteDailyIncome(income: any): void {
    // Check if can be deleted
    if (!income.canBeEdited) {
      Swal.fire({
        icon: "warning",
        title: "O'chirib bo'lmaydi",
        text: "Bu yozuvni faqat yaratilgan kuni o'chirish mumkin",
      });
      return;
    }

    Swal.fire({
      title: "Ishonchingiz komilmi?",
      text: "Bu kunlik umumiy kirim yozuvini o'chirmoqchimisiz?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ha, o'chirish",
      cancelButtonText: "Bekor qilish",
      confirmButtonColor: "#f44336",
    }).then((result) => {
      if (result.isConfirmed) {
        this.dailyIncomeService.deleteDailyIncomeOverall(income.id).subscribe({
          next: () => {
            Swal.fire({
              icon: "success",
              title: "O'chirildi!",
              text: "Kunlik umumiy kirim o'chirildi",
              timer: 2000,
              showConfirmButton: false,
            });
            this.loadDailyIncomes();
            this.loadTodayEntry();
          },
          error: (error) => {
            console.error("Error deleting daily income:", error);
            Swal.fire({
              icon: "error",
              title: "Xatolik!",
              text:
                error.error?.error ||
                "Kunlik kirimni o'chirishda xatolik yuz berdi",
            });
          },
        });
      }
    });
  }
}
