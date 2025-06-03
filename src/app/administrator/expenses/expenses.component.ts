import { DatePipe } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { Sort } from "@angular/material/sort";
import { AuthService } from "src/app/services/auth.service";
import { CategoriesService } from "src/app/services/categories.service";
import { ExpenseService } from "src/app/services/expense.service";
import Swal from "sweetalert2";

import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";

declare interface TableData {
  headerRow: string[];
}
@Component({
  selector: "app-expenses",
  templateUrl: "./expenses.component.html",
  styleUrls: ["./expenses.component.css"],
})
export class ExpensesComponent implements OnInit {
  private expenseService = inject(ExpenseService);
  private expenseCatService = inject(CategoriesService);
  private authService = inject(AuthService);
  expenseList: string[] = [];
  usersList: any[] = [];
  expenseCats: any[] = [];
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
  adminId: string;

  // STORING FILTERED INCOME DATA
  filteredExpenses: any[];

  constructor(private datePipe: DatePipe) {
    this.loadExpenses();
    this.loadExpenseCats();
    this.loadUsers();
  }

  ngOnInit(): void {
    this.tableData1 = {
      headerRow: [
        "№/Jami",
        "So'mda",
        "Dollarda",
        "Kartadan",
        "Kompaniya hisobidan",
        "Izoh",
        "Manager ID",
        "Kategoriyasi",
        "Sanasi",
        "Amallar",
      ],
    };
    this.loadExpenses();
    this.loadExpenseCats();
    this.loadUsers();
    this.adminId = localStorage.getItem("userId");
  }

  pagebyNum(ipage) {
    this.currentPage = ipage;
    this.isPagesActive = true;
    document.getElementById("listcard").scrollIntoView();
    this.loadExpenses();
  }
  // TRANSFORMING DATE VALUES
  fromFunction(date) {
    this.danValue = this.datePipe.transform(date.value, "yyyy-MM-dd");
  }
  toFunction(date) {
    this.gachaValue = this.datePipe.transform(date.value, "yyyy-MM-dd");
  }

  // Component-level filter and sort state
  sortCategory_id: string = "";
  sortComment: string = "";
  sortStaff_id: string = "";
  sortStartDate: string = "";
  sortEndDate: string = "";
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
      this.sortCategory_id,
      this.sortComment,
      this.sortStaff_id,
      this.danValue,
      this.gachaValue,
      this.sortField,
      this.sortDirection
    );
  }

  // Called when user applies a filter (e.g. selects category, comment, staff)
  applyFilters(category_id: string, comment: string, staff_id: string) {
    this.sortCategory_id = category_id;
    this.sortComment = comment;
    this.sortStaff_id = staff_id;

    // Reuse last sort field + direction
    // Reuse last sort field + direction
    this.getListOfExpensesWIthFilter(
      category_id,
      comment,
      staff_id,
      this.danValue,
      this.gachaValue,
      this.sortField,
      this.sortDirection
    );
  }

  // LOAD  INCOME CATS
  loadExpenseCats() {
    return this.expenseCatService.getExCats().subscribe({
      next: (res) => {
        this.expenseCats = res;
        console.log("expense cats ", this.expenseCats);
      },
      error: (err) => {
        this.errorMessage = err.error.error;
      },
    });
  }

  // LOAD  USERS LIST
  loadUsers() {
    return this.authService.loadUsers().subscribe({
      next: (res) => {
        this.usersList = res;
      },
      error: (err) => {
        this.errorMessage = err.error.error;
      },
    });
  }

  // LOADING EXPENSES WITHOUT FILTER
  loadExpenses() {
    this.expenseService.getExpenses(this.currentPage).subscribe({
      next: (res) => {
        this.expenseList = res.expenses;
        this.filteredExpenses = [];
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
      `&category_id=` +
      this.sortCategory_id +
      `&comment=` +
      this.sortComment +
      `&staff_id=` +
      this.sortStaff_id +
      `&sort=` +
      this.sortField +
      `&order=` +
      this.sortDirection;

    return this.expenseService
      .getExpensesWithFilter(this.currentPage, filterLink)
      .subscribe({
        next: (res) => {
          this.expenseList = res.expenses;
          this.filteredExpenses = res.expenses;
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
    category_id: string,
    comment: string,
    staff_id: string,
    startDate: string,
    endDate: string,
    sortField: string,
    sortDirection: string
  ) {
    const filterLink =
      `&category_id=` +
      category_id +
      `&comment=` +
      comment +
      `&staff_id=` +
      staff_id +
      `&startDate=` +
      startDate +
      `&endDate=` +
      endDate +
      `&sort=` +
      sortField +
      `&order=` +
      sortDirection;

    return this.expenseService
      .getExpensesWithFilter(this.currentPage, filterLink)
      .subscribe({
        next: (res) => {
          this.expenseList = res.expenses;
          this.filteredExpenses = res.expenses;
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

  // UPLOADING FILTERED INCOME DATA IN EXEL FILE
  exportToExel(data: any[], fileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    // Set column widths manually
    worksheet["!cols"] = [
      { wch: 10 }, // Soʻmda
      { wch: 10 }, // Dollar
      { wch: 10 }, // Karta
      { wch: 20 }, // Hisobdan
      { wch: 10 }, // Xodim ID
      { wch: 10 }, // Admin ID
      { wch: 20 }, // Kategoriya
      { wch: 30 }, // Izoh
      { wch: 15 }, // Sana
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
      type: "application/octet-stream",
    });

    const timestamp = new Date().toISOString().slice(0, 10);
    const fullName = `${fileName}_${timestamp}.xlsx`;

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fullName;
    link.click();

    FileSaver.saveAs(blob, `${fullName}.xlsx`);
  }
  // format date
  fmd(date: any) {
    return this.datePipe.transform(date, "d MMMM, y"); // Example: "31 may, 2025"
  }
  // formate currency
  formatCurrency = (val: any) => {
    return val ? val.toLocaleString("uz-UZ") : "";
  };

  // DOWNLOAD EXEL
  downlaodExcel() {
    if (this.filteredExpenses.length) {
      const filteredData = this.filteredExpenses.map((exp) => ({
        Somda: this.formatCurrency(+exp.uzs_cash) || 0,
        Dollarda: this.formatCurrency(+exp.usd_cash) || 0,
        Kartadan: this.formatCurrency(+exp.card) || 0,
        "Kompaniya Hisobidan": this.formatCurrency(+exp.account) || 0,
        "XODIM ID": exp.staff_id,
        "Admin ID": exp.admin_id,
        Kategoriyasi: exp.category.name,
        Izoh: exp.comment,
        Sanasi: this.fmd(exp.date),
      }));
      this.exportToExel(filteredData, "Xarajatlar");
      return;
    }
    alert("No data");
  }

  // ADDING NEW EXPENSE
  async addExpense() {
    const optionsHtml = this.expenseCats
      .map((cat) => `<option value="${cat.id}">${cat.name}</option>`)
      .join("");
    const optionsHtmlUsers = this.usersList
      .map((user) => `<option value="${user.id}">${user.username}</option>`)
      .join("");
    const result = await Swal.fire({
      title: "Yangi Kirim Qo'shish",
      html:
        `<div class="form-group">` +
        '<input id="input-uzs" type="text" class="form-control m-2" placeholder="Naqd Somda..." />' +
        '<input id="input-usd" type="text" class="form-control m-2" placeholder="Naqd Dollarda..." />' +
        '<input id="input-card" type="text" class="form-control m-2" placeholder="Kartadan..." />' +
        '<input id="input-account" type="text" class="form-control m-2" placeholder="Kompaniya Hisobidan..." />' +
        '<input id="input-comment" type="text" class="form-control m-2" placeholder="IZOH" />' +
        `<select id="swal-staffId" class="form-control m-2" >
        <option value="" disabled selected>Xodimlardan birini tanlang</option>
        ${optionsHtmlUsers}
        </select>` +
        ` <select id="swal-catId" class="form-control m-2" >
        <option value="" disabled selected>Kategoriya Tanlang</option>
        ${optionsHtml}
      </select>` +
        `</div>`,
      showCancelButton: true,
      confirmButtonText: "Saqlash",
      cancelButtonText: "Bekor Qilish",
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false,

      preConfirm: () => {
        let usd_cash = Number($("#input-usd").val());
        let uzs_cash = Number($("#input-uzs").val());
        let card = Number($("#input-card").val());
        let account = Number($("#input-account").val());
        let staff_id = Number($("#swal-staffId").val());
        let date = Date.now();
        let comment = $("#input-comment").val();
        let category_id = Number($("#swal-catId").val());
        +usd_cash;
        return {
          usd_cash,
          uzs_cash,
          card,
          account,
          admin_id: +this.adminId,
          date,
          staff_id,
          comment,
          category_id,
        };
      },
    });

    if (result.isConfirmed && result.value) {
      // console.log("result value ", result.value);
      if (!result.value.category_id || !result.value.staff_id) {
        Swal.fire("Xatolik", "KATEGORIYA va Xodim tanlanishi  kerak!", "error");
        return;
      }
      Swal.showLoading();
      this.expenseService.addExpense(result.value).subscribe({
        next: (res) => {
          this.loadExpenses();
          Swal.fire("Muvaffaqiyat!", "Yangi Kirim kiritildi!.", "success");
        },
        error: (err) => {
          Swal.fire("Xatolik", err.error?.error || err.message, "error");
        },
      });
    }
  }

  // UPDATING INCOME DATA
  async editExpense(expense: any) {
    // console.log("income data ", income);

    const optionsHtml = this.expenseCats
      .map(
        (cat) =>
          `<option value="${cat.id}"${
            cat.id === expense.category_id ? "selected" : ""
          }>${cat.name ? cat.name : ""}</option>`
      )
      .join("");

    const optionsHtmlUser = this.usersList
      .map(
        (user) =>
          `<option value="${user.id}"${
            user.id === expense.staff_id ? "selected" : ""
          }>${user.username ? user.username : ""}</option>`
      )
      .join("");

    const result = await Swal.fire({
      title: "Kirimni Tahrirlash1!",
      html: `
  <div class="form-group">
    <div style="display: flex; align-items: center;" class="m-2">
      <label for="input-usd" style="width: 180px;">Naqd Dollarda</label>
      <input id="input-usd" value="${
        expense.usd_cash ? expense.usd_cash : ""
      }" type="text" class="form-control" placeholder="Naqd Dollarda..." />
    </div>

    <div style="display: flex; align-items: center;" class="m-2">
      <label for="input-uzs" style="width: 180px;">Naqd So'mda</label>
      <input id="input-uzs" type="text" value="${
        expense.uzs_cash ? expense.uzs_cash : ""
      }" class="form-control" placeholder="Naqd So'mda..." />
    </div>

    <div style="display: flex; align-items: center;" class="m-2">
      <label for="input-card" style="width: 180px;">Kartadan</label>
      <input id="input-card" type="text" value="${
        expense.card ? expense.card : ""
      }" class="form-control" placeholder="Kartadan..." />
    </div>

    <div style="display: flex; align-items: center;" class="m-2">
      <label for="input-account" style="width: 180px;">Kompaniya Hisobiga</label>
      <input id="input-account" type="text" value="${
        expense.account ? expense.account : ""
      }" class="form-control" placeholder="Kompaniya Hisobiga..." />
    </div>
    
    <div style="display: flex; align-items: center;" class="m-2">
      <label for="input-date" style="width: 180px;">Olingan Sanasi</label>
      <input id="input-date" type="date" value="${
        expense.date ? expense.date.split("T")[0] : ""
      }" class="form-control" placeholder="Olingan Sanasi..." />
    </div>

    <div style="display: flex; align-items: center;" class="m-2">
      <label for="input-comment" style="width: 180px;">IZOH</label>
      <input id="input-comment" type="text" value="${
        expense.comment ? expense.comment : ""
      }" class="form-control" placeholder="IZOH" />
    </div>

     <div style="display: flex; align-items: center;" class="m-3">
      <label for="swal-userId" style="width: 180px;">Xodimni Tanlang</label>
      <select id="swal-userId" class="form-control">
        <option value="" disabled selected>Xodimni Tanlang</option>
        ${optionsHtmlUser}
      </select>
    </div>

    <div style="display: flex; align-items: center;" class="m-3">
      <label for="swal-catId" style="width: 180px;">Kategoriya Tanlang</label>
      <select id="swal-catId" class="form-control">
        <option value="" disabled selected>Kategoriya Tanlang</option>
        ${optionsHtml}
      </select>
    </div>
  </div>
`,

      showCancelButton: true,
      confirmButtonText: "Saqlash",
      cancelButtonText: "Bekor Qilish",
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false,

      preConfirm: () => {
        let usd_cash = Number($("#input-usd").val());
        let uzs_cash = Number($("#input-uzs").val());
        let card = Number($("#input-card").val());
        let account = Number($("#input-account").val());

        let date = $("#input-date").val();
        let comment = $("#input-comment").val();
        let category_id = Number($("#swal-catId").val());
        let staff_id = Number($("#swal-userId").val());

        return {
          usd_cash,
          uzs_cash,
          card,
          account,
          staff_id,
          date,
          comment,
          category_id,
        };
      },
    });

    if (result.isConfirmed && result.value) {
      if (
        !result.value.category_id ||
        !result.value.date ||
        !result.value.staff_id
      ) {
        Swal.fire(
          "Xatolik",
          "KATEGORIYA va XODIM tanlanishi va SANA kiritilishi kerak!",
          "error"
        );
        return;
      }

      Swal.showLoading();
      this.expenseService.editExpense(expense.id, result.value).subscribe({
        next: (res) => {
          this.loadExpenses();
          Swal.fire("Muvaffaqiyat!", "Kirim Tahrirlandi!.", "success");
        },
        error: (err) => {
          Swal.fire("Xatolik", err.error?.error || err.message, "error");
        },
      });
    }
  }

  // DELETING EXPENSE WITH ID
  delete(id: string) {
    Swal.fire({
      title: "O'chirish Amaliyoti uchub parol kiriting",
      allowEnterKey: true,
      input: "text",
      confirmButtonText: "Kiritish",
      customClass: {
        confirmButton: "btn btn-success",
      },
      buttonsStyling: false,

      preConfirm: (valueB) => {
        if (valueB == "2") {
          Swal.fire({
            icon: "question",
            title: "Rostan ham bu KIRIM malumotlarini o'chirmoqchimisiz",
            showCancelButton: true,
            confirmButtonText: "Ha, O'chirish",
            cancelButtonText: "Bekor qilish",
          }).then((result) => {
            if (result.isConfirmed) {
              this.expenseService.deleteExpense(+id).subscribe({
                next: () => {
                  Swal.fire(
                    "Muvaffaqiyat",
                    "KIRIM malumotlari o'chirildi!",
                    "success"
                  );
                  this.loadExpenses();
                },
                error: (err) => {
                  Swal.fire("Xatolik", err.error.error, "error");
                },
              });
            }
          });
        } else {
          Swal.fire("Parol Notogri!", "Boshqattan parol kiriting!", "error");
          return;
        }
      },
    });
  }
}
