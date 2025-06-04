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
@Component({
  selector: "app-all-incomes",
  templateUrl: "./all-incomes.component.html",
  styleUrls: ["./all-incomes.component.css"],
})
export class AllIncomesComponent {
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
        "Admin IDsi",
        "Mijoz IDsi",
        "Partiya Raqami",
        "Izoh",
        "Kategoriyasi",
        "CheckedStatus",
        "Sanasi",
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
}
