import { Component, OnInit } from "@angular/core";
import { CategoriesService } from "src/app/services/categories.service";
import Swal from "sweetalert2";
import { firstValueFrom } from "rxjs";
@Component({
  selector: "app-expense-categories",
  templateUrl: "./expense-categories.component.html",
  styleUrls: ["./expense-categories.component.css"],
})
export class ExpenseCategoriesComponent implements OnInit {
  expenseCats: string[] = [];
  errorMessage: string;
  constructor(private catService: CategoriesService) {}

  ngOnInit(): void {
    this.getExpenseCats();
  }

  // get expense Cats
  getExpenseCats() {
    return this.catService.getExCats().subscribe({
      next: (res) => {
        console.log("ex cats ", res);

        this.expenseCats = res;
      },
      error: (err) => {
        this.errorMessage = err.error.error;
      },
    });
  }
  // add expense cat
  addExpemseCat() {
    return Swal.fire({
      title: "Chiqim uchun kategoriya qo'shish",
      text: "Kategoriya nomini pastga yozing!",
      input: "text",
      inputPlaceholder: "Masalan: Grocery",
      allowEnterKey: true,

      showCancelButton: true,
      confirmButtonText: "Saqlash",
      cancelButtonText: "Bekor Qilish",

      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-info",
      },
      buttonsStyling: false,

      preConfirm: (categoryName) => {
        if (!categoryName) {
          Swal.showValidationMessage("Iltimos, kategoriya nomini kiriting");
          return;
        }
        // Return a Promise so SweetAlert knows to wait
        return this.catService
          .addExCat(categoryName)
          .toPromise()
          .then((res) => {
            // refresh your local list
            this.getExpenseCats();
            return res;
          })
          .catch((err) => {
            // show inline validation error
            Swal.showValidationMessage(
              `Xatolik: ${err.error.error || err.message}`
            );
          });
      },
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire(
          "Chiqim uchun yangi kategoriya qo'shildi",
          "Kategoriyalar soni bittaga ko‘paydi",
          "success"
        );
      }
    });
  }

  // update
  updateCat(catId: string, currentName: string) {
    return Swal.fire({
      title: `${currentName} nomli kategoriyani tahrirlash`,
      text: "Yangi kategoriya nomini kiriting:",
      input: "text",
      inputPlaceholder: "Yangi nom....",
      inputValue: currentName, // prefill with existing name
      allowEnterKey: true,

      showCancelButton: true,
      confirmButtonText: "Saqlash",
      cancelButtonText: "Bekor Qilish",

      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-info",
      },
      buttonsStyling: false,

      preConfirm: (newName: string) => {
        if (!newName) {
          Swal.showValidationMessage("Iltimos, kategoriya nomini kiriting");
          return;
        }
        // Return a promise that resolves with the new name
        return firstValueFrom(this.catService.updateExCat(catId, newName))
          .then(() => {
            this.getExpenseCats();
            return newName;
          })
          .catch((err) => {
            Swal.showValidationMessage(
              `Xatolik: ${err?.error?.error || err.message}`
            );
          });
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        Swal.fire(
          "Muvaffaqiyat!",
          `"${currentName}" kategoriyasi endi "${result.value}" nomi bilan yangilandi.`,
          "success"
        );
      }
    });
  }

  // delete

  deleteInCat(catId: string, name: string) {
    console.log("cat id ", catId, name);

    Swal.fire({
      title: "O'chirish!",
      text: `Ushbu "${name}" nomli kategoriyani kategoriyalar ro'yhatidan o'chirish!`,
      allowEnterKey: true,
      confirmButtonText: "O'chirilsin!",
      showCancelButton: true,
      cancelButtonText: "Bekor Qilish",
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-info",
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.catService.deleteExCat(catId).subscribe({
          next: (res) => {
            Swal.fire(
              "O'chirildi",
              `${name} nomli Kategoriya "O'chirildi!`,
              "success"
            );
            return this.getExpenseCats();
          },
          error: (err) => {
            Swal.fire("Xatolik!", `xato: ${err.error.error}`, "error");
          },
        });
      }
    });
  }
}
