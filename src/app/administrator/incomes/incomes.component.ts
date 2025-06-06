import { Component, inject, OnInit } from "@angular/core";
import { CategoriesService } from "src/app/services/categories.service";
import { IncomesService } from "src/app/services/incomes.service";
import Swal from "sweetalert2";
import * as $ from "jquery";
import { DatePipe } from "@angular/common";
import { Sort } from "@angular/material/sort";

import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";

declare interface TableData {
  headerRow: string[];
}
@Component({
  selector: "app-incomes",
  templateUrl: "./incomes.component.html",
  styleUrls: ["./incomes.component.css"],
})
export class IncomesComponent implements OnInit {
  private incomeService = inject(IncomesService);
  private incomeCatService = inject(CategoriesService);

  incomesList: string[] = [];
  incomeCats: any[] = [];
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

  // STORING FILTERED INCOME DATA
  filteredIncomes = [];

  constructor(private datePipe: DatePipe) {
    this.loadIncomes();
    this.loadIncomeCats();
  }
  ngOnInit(): void {
    //pagination
    this.currentPage = 0;
    this.needPagination = false;
    this.isPagesActive = false;

    this.tableData1 = {
      headerRow: [
        "№/Jami",
        "So'mda",
        "Dollarda",
        "Kartadan",
        "Kompaniya hisobiga",
        "Izoh",
        "Admin IDsi",
        "Mijoz IDsi",
        "Partiya Raqami",
        "Kategoriyasi",
        "Sanasi",
        "Amallar",
      ],
    };
    this.staff_id = localStorage.getItem("userId");
    this.loadIncomes();
    this.loadIncomeCats();
  }

  pagebyNum(ipage) {
    this.currentPage = ipage;
    this.isPagesActive = true;
    document.getElementById("listcard").scrollIntoView();
    this.loadIncomes();
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
      return this.getListOfIncomesWithDate();
    }
    // Reuse existing filter + sort values
    this.getListOfIncomesWIthFilter(
      this.sortCategory_id,
      this.sortComment,
      this.sortStaff_id,
      this.danValue,
      this.gachaValue,
      this.sortField,
      this.sortDirection
    );
    this.getListOfIncomesWithDate();
  }

  // Called when user applies a filter (e.g. selects category, comment, staff)
  applyFilters(category_id: string, comment: string, staff_id: string) {
    this.sortCategory_id = category_id;
    this.sortComment = comment;
    this.sortStaff_id = staff_id;

    // Reuse last sort field + direction

    // Reuse last sort field + direction
    this.getListOfIncomesWIthFilter(
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
  loadIncomeCats() {
    return this.incomeCatService.getInCats().subscribe({
      next: (res) => {
        this.incomeCats = res;
      },
      error: (err) => {
        this.errorMessage = err.error.error;
      },
    });
  }

  // LOADING INCOMES WITHOUT FILTER
  loadIncomes() {
    this.incomeService.getIncomes(this.currentPage).subscribe({
      next: (res) => {
        this.incomesList = res.incomes;
        this.filteredIncomes = [];
        // console.log("incomes ", this.incomesList);
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
  // LOADING INCOMES WITH DATE FILTER
  getListOfIncomesWithDate() {
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

    return this.incomeService
      .getIncomesWithFilter(this.currentPage, filterLink)
      .subscribe({
        next: (res) => {
          this.incomesList = res.incomes;
          this.filteredIncomes = res.incomes;
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
  // LOAD INCOMES WITH FILTER OF CATS, COMMENT AND ADMIN ID
  getListOfIncomesWIthFilter(
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

    return this.incomeService
      .getIncomesWithFilter(this.currentPage, filterLink)
      .subscribe({
        next: (res) => {
          this.incomesList = res.incomes;
          this.filteredIncomes = res.incomes;
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
      { wch: 10 }, // user ID
      { wch: 20 }, // part num
      { wch: 20 }, // Admin ID
      { wch: 30 }, // Kategoriya
      { wch: 20 }, // Izoh
      { wch: 20 }, // Sana
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

    FileSaver.saveAs(blob, `${fileName}.xlsx`);
  }
  // format date
  fmd(date: any) {
    return this.datePipe.transform(date, "d MMMM, y"); // Example: "31 may, 2025"
  }
  // formate currency
  formatCurrency = (val: number) => {
    return val ? val.toLocaleString("uz-UZ") : "";
  };

  // DOWNLOAD EXEL
  downlaodExcel() {
    if (this.filteredIncomes.length) {
      const filteredData = this.filteredIncomes.map((exp) => ({
        Somda: this.formatCurrency(+exp.uzs_cash) || 0,
        Dollarda: this.formatCurrency(+exp.usd_cash) || 0,
        Kartaga: this.formatCurrency(+exp.card) || 0,
        "Kompaniya Hisobiga": this.formatCurrency(+exp.account) || 0,
        "Mijoz IDsi": exp.userId,
        "Partiya Raqami": exp.part_num,
        Admin_ID: exp.admin_id,
        Izoh: exp.comment,
        Kategoriyasi: exp.category.name,
        Sanasi: this.fmd(exp.date),
      }));
      this.exportToExel(filteredData, "Kirimlar");
      return;
    }
    alert("No data");
  }

  // add income
  async addIncome() {
    const optionsHtml = this.incomeCats
      .map((cat) => `<option value="${cat.id}">${cat.name}</option>`)
      .join("");

    const result = await Swal.fire({
      title: "Yangi Kirim Qo'shish",
      html:
        `<div class="form-group">` +
        '<input id="input-uzs" type="text" class="form-control m-2" placeholder="Naqd Somda..." />' +
        '<input id="input-usd" type="text" class="form-control m-2" placeholder="Naqd Dollarda..." />' +
        '<input id="input-card" type="text" class="form-control m-2" placeholder="Kartadan..." />' +
        '<input id="input-account" type="text" class="form-control m-2" placeholder="Kompaniya Hisobiga..." />' +
        '<input id="input-comment" type="text" class="form-control m-2" placeholder="IZOH" />' +
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
        let userId = Number($("#input-userId").val());
        let part_num = $("#input-part_num").val();
        let date = Date.now();
        let comment = $("#input-comment").val();
        let category_id = Number($("#swal-catId").val());
        +usd_cash;
        return {
          usd_cash,
          uzs_cash,
          card,
          account,
          userId,
          part_num,
          admin_id: this.staff_id,
          date,
          comment,
          category_id,
        };
      },
    });

    if (result.isConfirmed && result.value) {
      if (!result.value.category_id) {
        Swal.fire("Xatolik", "KATEGORIYA tanlanishi kerak!", "error");
        return;
      }
      Swal.showLoading();
      this.incomeService.addIncome(result.value).subscribe({
        next: (res) => {
          this.loadIncomes();
          Swal.fire("Muvaffaqiyat!", "Yangi Kirim kiritildi!.", "success");
        },
        error: (err) => {
          Swal.fire("Xatolik", err.error?.error || err.message, "error");
        },
      });
    }
  }

  // UPDATING INCOME DATA
  async editIncome(income: any) {
    // console.log("income data ", income);

    const optionsHtml = this.incomeCats
      .map(
        (cat) =>
          `<option value="${cat.id}"${
            cat.id === income.category_id ? "selected" : ""
          }>${cat.name ? cat.name : ""}</option>`
      )
      .join("");

    const result = await Swal.fire({
      title: "Kirimni Tahrirlash1!",
      html: `
  <div class="form-group">
    <div style="display: flex; align-items: center;" class="m-2">
      <label for="input-usd" style="width: 180px;">Naqd Dollarda</label>
      <input id="input-usd" value="${
        income.usd_cash ? income.usd_cash : ""
      }" type="text" class="form-control" placeholder="Naqd Dollarda..." />
    </div>

    <div style="display: flex; align-items: center;" class="m-2">
      <label for="input-uzs" style="width: 180px;">Naqd So'mda</label>
      <input id="input-uzs" type="text" value="${
        income.uzs_cash ? income.uzs_cash : ""
      }" class="form-control" placeholder="Naqd So'mda..." />
    </div>

    <div style="display: flex; align-items: center;" class="m-2">
      <label for="input-card" style="width: 180px;">Kartadan</label>
      <input id="input-card" type="text" value="${
        income.card ? income.card : ""
      }" class="form-control" placeholder="Kartadan..." />
    </div>

    <div style="display: flex; align-items: center;" class="m-2">
      <label for="input-account" style="width: 180px;">Kompaniya Hisobiga</label>
      <input id="input-account" type="text" value="${
        income.account ? income.account : ""
      }" class="form-control" placeholder="Kompaniya Hisobiga..." />
    </div>

    <div style="display: flex; align-items: center;" class="m-2">
      <label for="input-userId" style="width: 180px;">Mijoz IDsi</label>
      <input id="input-userId" type="text" value="${
        income.userId ? income.userId : ""
      }" class="form-control" placeholder="Mijoz IDsi..." />
    </div>

    <div style="display: flex; align-items: center;" class="m-2">
      <label for="input-part_num" style="width: 180px;">Partiya Raqami</label>
      <input id="input-part_num" type="text" value="${
        income.part_num ? income.part_num : ""
      }" class="form-control" placeholder="Partiya Raqami..." />
    </div>
    <div style="display: flex; align-items: center;" class="m-2">
      <label for="input-date" style="width: 180px;">Olingan Sanasi</label>
      <input id="input-date" type="date" value="${
        income.date ? income.date.split("T")[0] : ""
      }" class="form-control" placeholder="Olingan Sanasi..." />
    </div>

    <div style="display: flex; align-items: center;" class="m-2">
      <label for="input-comment" style="width: 180px;">IZOH</label>
      <input id="input-comment" type="text" value="${
        income.comment ? income.comment : ""
      }" class="form-control" placeholder="IZOH" />
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
        let userId = Number($("#input-userId").val());
        let part_num = $("#input-part_num").val();
        let date = $("#input-date").val();
        let comment = $("#input-comment").val();
        let category_id = Number($("#swal-catId").val());

        return {
          usd_cash,
          uzs_cash,
          card,
          account,
          userId,
          part_num,
          date,
          comment,
          category_id,
        };
      },
    });

    if (result.isConfirmed && result.value) {
      if (!result.value.category_id || !result.value.date) {
        Swal.fire(
          "Xatolik",
          "KATEGORIYA tanlanishi va  SANA kiritilishi kerak!",
          "error"
        );
        return;
      }

      Swal.showLoading();
      this.incomeService.updateIncome(income.id, result.value).subscribe({
        next: (res) => {
          this.loadIncomes();
          Swal.fire("Muvaffaqiyat!", "Kirim Tahrirlandi!.", "success");
        },
        error: (err) => {
          Swal.fire("Xatolik", err.error?.error || err.message, "error");
        },
      });
    }
  }

  // deleting the income
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
              this.incomeService.delete(+id).subscribe({
                next: () => {
                  Swal.fire(
                    "Muvaffaqiyat",
                    "KIRIM malumotlari o'chirildi!",
                    "success"
                  );
                  this.loadIncomes();
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
