import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subject, takeUntil, firstValueFrom } from "rxjs";
import Swal from "sweetalert2";

import { CategoriesService } from "src/app/services/categories.service";

/**
 * Category interface
 */
interface Category {
  id: string;
  name: string;
}

/**
 * SweetAlert configuration constants
 */
const SWAL_BUTTON_CONFIG = {
  customClass: {
    confirmButton: "btn btn-success",
    cancelButton: "btn btn-info",
  },
  buttonsStyling: false,
};

@Component({
  selector: "app-categories-list",
  templateUrl: "./categories-list.component.html",
  styleUrls: ["./categories-list.component.css"],
})
export class CategoriesListComponent implements OnInit, OnDestroy {
  // State
  incomeCats: Category[] = [];
  errorMessage: string = "";
  isLoading: boolean = false;

  // RxJS cleanup
  private destroy$ = new Subject<void>();

  constructor(private catService: CategoriesService) {}

  ngOnInit(): void {
    this.loadIncomeCats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load income categories
   */
  private loadIncomeCats(): void {
    this.isLoading = true;
    this.errorMessage = "";

    this.catService
      .getInCats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.incomeCats = res;
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage =
            err?.error?.error || "Ma'lumotlarni yuklashda xatolik";
          this.isLoading = false;
          console.error("Error loading income categories:", err);
        },
      });
  }

  /**
   * Add new income category
   */
  async addIncome(): Promise<void> {
    const result = await Swal.fire({
      title: "Kirim uchun kategoriya qo'shish",
      text: "Kategoriya nomini pastga yozing!",
      input: "text",
      inputPlaceholder: "Masalan: Xarid",
      allowEnterKey: true,
      showCancelButton: true,
      confirmButtonText: "Saqlash",
      cancelButtonText: "Bekor Qilish",
      ...SWAL_BUTTON_CONFIG,
      preConfirm: async (categoryName) => {
        if (!categoryName?.trim()) {
          Swal.showValidationMessage("Iltimos, kategoriya nomini kiriting");
          return false;
        }

        try {
          const res = await firstValueFrom(
            this.catService.addInCat(categoryName.trim())
          );
          this.loadIncomeCats();
          return res;
        } catch (err: any) {
          Swal.showValidationMessage(
            `Xatolik: ${
              err?.error?.error || err?.message || "Noma'lum xatolik"
            }`
          );
          return false;
        }
      },
    });

    if (result.isConfirmed) {
      Swal.fire({
        icon: "success",
        title: "Muvaffaqiyat!",
        text: "Kirim uchun yangi kategoriya qo'shildi",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  }

  /**
   * Update category
   */
  async updateCat(catId: string, currentName: string): Promise<void> {
    const result = await Swal.fire({
      title: `"${currentName}" kategoriyani tahrirlash`,
      text: "Yangi kategoriya nomini kiriting:",
      input: "text",
      inputPlaceholder: "Yangi nom....",
      inputValue: currentName,
      allowEnterKey: true,
      showCancelButton: true,
      confirmButtonText: "Saqlash",
      cancelButtonText: "Bekor Qilish",
      ...SWAL_BUTTON_CONFIG,
      preConfirm: async (newName: string) => {
        if (!newName?.trim()) {
          Swal.showValidationMessage("Iltimos, kategoriya nomini kiriting");
          return false;
        }

        try {
          await firstValueFrom(
            this.catService.updateInCats(catId, newName.trim())
          );
          this.loadIncomeCats();
          return newName.trim();
        } catch (err: any) {
          Swal.showValidationMessage(
            `Xatolik: ${
              err?.error?.error || err?.message || "Noma'lum xatolik"
            }`
          );
          return false;
        }
      },
    });

    if (result.isConfirmed && result.value) {
      Swal.fire({
        icon: "success",
        title: "Muvaffaqiyat!",
        text: `Kategoriya "${result.value}" nomi bilan yangilandi`,
        timer: 2000,
        showConfirmButton: false,
      });
    }
  }

  /**
   * Delete category
   */
  async deleteInCat(catId: string, name: string): Promise<void> {
    const result = await Swal.fire({
      title: "O'chirish!",
      text: `"${name}" kategoriyasini o'chirishni tasdiqlaysizmi?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ha, O'chirilsin!",
      cancelButtonText: "Bekor Qilish",
      ...SWAL_BUTTON_CONFIG,
    });

    if (result.isConfirmed) {
      this.catService
        .deleteInCat(catId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            Swal.fire({
              icon: "success",
              title: "O'chirildi!",
              text: `"${name}" kategoriyasi o'chirildi`,
              timer: 2000,
              showConfirmButton: false,
            });
            this.loadIncomeCats();
          },
          error: (err) => {
            Swal.fire({
              icon: "error",
              title: "Xatolik!",
              text: err?.error?.error || "Kategoriyani o'chirishda xatolik",
            });
          },
        });
    }
  }
}
