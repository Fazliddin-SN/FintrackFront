import { Component, inject, OnInit } from "@angular/core";

import Swal from "sweetalert2";
import * as $ from "jquery";
import { DatePipe } from "@angular/common";
import { Sort } from "@angular/material/sort";

import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";
import { BalanceControlService } from "src/app/services/balance.control.service";

declare interface TableData {
  headerRow: string[];
}
declare interface CurrentBalanceData {
  uzs_cash: string;
  usd_cash: string;
  card: string;
  account: string;
}

@Component({
  selector: "app-balance-control",
  templateUrl: "./balance-control.component.html",
  styleUrls: ["./balance-control.component.css"],
})
export class BalanceControlComponent implements OnInit {
  private balanceService = inject(BalanceControlService);

  totalBalance: string[] = [];
  currentBalance: CurrentBalanceData;

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
    this.loadTotalBalance();
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
        "Kompaniya hisobida",
        "Sanasi",
      ],
    };
    this.staff_id = localStorage.getItem("userId");
    this.loadTotalBalance();
    this.loadCurrentBalance();
  }

  pagebyNum(ipage) {
    this.currentPage = ipage;
    this.isPagesActive = true;
    document.getElementById("listcard").scrollIntoView();
    this.loadTotalBalance();
  }
  // TRANSFORMING DATE VALUES
  fromFunction(date) {
    this.danValue = this.datePipe.transform(date.value, "yyyy-MM-dd");
  }
  toFunction(date) {
    this.gachaValue = this.datePipe.transform(date.value, "yyyy-MM-dd");
  }

  // Component-level filter and sort state

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

    return this.getListOfIncomesWithDate();
  }

  // LOADING INCOMES WITHOUT FILTER
  loadTotalBalance() {
    this.balanceService.getTotalBalances(this.currentPage).subscribe({
      next: (res) => {
        this.totalBalance = res.balanceData;

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
      `&sort=` +
      this.sortField +
      `&order=` +
      this.sortDirection;

    return this.balanceService
      .getTotalBalancesWithFilter(this.currentPage, filterLink)
      .subscribe({
        next: (res) => {
          this.totalBalance = res.balanceData;
          this.filteredIncomes = res.balanceData;
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
        Sanasi: this.fmd(exp.date),
      }));
      this.exportToExel(filteredData, "Umumiy_balance");
      return;
    }
    alert("No data");
  }

  loadCurrentBalance() {
    return this.balanceService.getCurrentBalance().subscribe({
      next: (res) => {
        this.currentBalance = res.currentBalance;
        // console.log("current balance ", this.currentBalance);
      },
      error: (err) => [(this.errorMessage = err.error.error)],
    });
  }
}
