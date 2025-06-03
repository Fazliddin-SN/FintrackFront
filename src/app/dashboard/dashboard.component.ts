import { Component, OnInit, AfterViewInit, inject } from "@angular/core";
import { TableData } from "../md/md-table/md-table.component";
import { ChartConfiguration, ChartType } from "chart.js";
import { ExpenseService } from "../services/expense.service";
import { RouterOutlet } from "@angular/router";
import {
  CanvasJS,
  CanvasJSAngularChartsModule,
} from "@canvasjs/angular-charts";
declare const $: any;

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
})
export class DashboardComponent implements OnInit {
  private expenseService = inject(ExpenseService);

  // constructor(private navbarTitleService: NavbarTitleService, private notificationService: NotificationService) { }
  public tableData: TableData;
  username: string;
  expenses = [];

  totalBalance = 4000000; // Total balance in UZS
  private USD_TO_UZS = 12500;
  categoryTotals = {};
  currentPage = 0;
  errorMessage: string;
  chartOptions: any;

  // constructor(private navbarTitleService: NavbarTitleService) { }
  public ngOnInit() {
    this.username = localStorage.getItem("username");
    // this.loadExpenses();
    // this.makeNewArray();
  }

  // // LOADING EXPENSES WITHOUT FILTER
  // loadExpenses() {
  //   this.expenseService.getMyExpenses(this.currentPage).subscribe({
  //     next: (res) => {
  //       this.expenses = res.expenses;
  //       this.makeNewArray(); // ✅ now run after data is ready
  //       this.renderChart("chartContainer");
  //     },
  //     error: (err) => {
  //       this.errorMessage = err.error.error;
  //     },
  //   });
  // }

  // makeNewArray() {
  //   this.expenses.forEach((exp) => {
  //     const categoryId = exp.category_id;
  //     const categoryName = exp.category?.name || "Unknown";

  //     const usd = parseFloat(exp.usd_cash) || 0;
  //     const uzs = parseFloat(exp.uzs_cash) || 0;
  //     const card = parseFloat(exp.card) || 0;

  //     const convertedUsd = usd * this.USD_TO_UZS;
  //     const total = convertedUsd + uzs + card;

  //     if (!this.categoryTotals[categoryId]) {
  //       this.categoryTotals[categoryId] = {
  //         category_id: categoryId,
  //         category_name: categoryName,
  //         amount: 0,
  //       };
  //     }

  //     this.categoryTotals[categoryId].amount += total;
  //   });

  //   const result = Object.values(this.categoryTotals);

  //   // Build CanvasJS-compatible dataPoints
  //   const dataPoints = result.map((item: any) => ({
  //     name: item.category_name,
  //     y: parseFloat(((item.amount / this.totalBalance) * 100).toFixed(2)),
  //   }));

  //   // Assign CanvasJS chartOptions
  //   this.chartOptions = {
  //     animationEnabled: true,
  //     theme: "light2",
  //     exportEnabled: true,
  //     title: {
  //       text: "Category Spending Contribution (%)",
  //     },
  //     subtitles: [
  //       {
  //         text: "Based on UZS equivalent",
  //       },
  //     ],
  //     data: [
  //       {
  //         type: "pie",
  //         indexLabel: "{name}: {y}%",
  //         dataPoints: dataPoints,
  //       },
  //     ],
  //   };
  // }

  // renderChart(containerId: string) {
  //   const chart = new CanvasJS.Chart(containerId, this.chartOptions);
  //   chart.render();
  // }

  //   this.tableData = {
  //     headerRow: ["ID", "Name", "Salary", "Country", "City"],
  //     dataRows: [
  //       ["US", "USA", "2.920	", "53.23%"],
  //       ["DE", "Germany", "1.300", "20.43%"],
  //       ["AU", "Australia", "760", "10.35%"],
  //       ["GB", "United Kingdom	", "690", "7.87%"],
  //       ["RO", "Romania", "600", "5.94%"],
  //       ["BR", "Brasil", "550", "4.34%"],
  //     ],
  //   };
  //   /* ----------==========     Daily Sales Chart initialization    ==========---------- */

  //   const dataDailySalesChart = {
  //     labels: ["M", "T", "W", "T", "F", "S", "S"],
  //     series: [[12, 17, 7, 17, 23, 18, 38]],
  //   };

  //   const optionsDailySalesChart = {
  //     lineSmooth: Chartist.Interpolation.cardinal({
  //       tension: 0,
  //     }),
  //     low: 0,
  //     high: 50, // creative tim: we recommend you to set the high sa the biggest value + something for a better look
  //     chartPadding: { top: 0, right: 0, bottom: 0, left: 0 },
  //   };

  //   const dailySalesChart = new Chartist.Line(
  //     "#dailySalesChart",
  //     dataDailySalesChart,
  //     optionsDailySalesChart
  //   );

  //   this.startAnimationForLineChart(dailySalesChart);
  //   /* ----------==========     Completed Tasks Chart initialization    ==========---------- */

  //   const dataCompletedTasksChart = {
  //     labels: ["12p", "3p", "6p", "9p", "12p", "3a", "6a", "9a"],
  //     series: [[230, 750, 450, 300, 280, 240, 200, 190]],
  //   };

  //   const optionsCompletedTasksChart = {
  //     lineSmooth: Chartist.Interpolation.cardinal({
  //       tension: 0,
  //     }),
  //     low: 0,
  //     high: 1000, // creative tim: we recommend you to set the high sa the biggest value + something for a better
  //     // look
  //     chartPadding: { top: 0, right: 0, bottom: 0, left: 0 },
  //   };

  //   const completedTasksChart = new Chartist.Line(
  //     "#completedTasksChart",
  //     dataCompletedTasksChart,
  //     optionsCompletedTasksChart
  //   );

  //   this.startAnimationForLineChart(completedTasksChart);

  //   /* ----------==========     Emails Subscription Chart initialization    ==========---------- */

  //   const dataWebsiteViewsChart = {
  //     labels: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
  //     series: [[542, 443, 320, 780, 553, 453, 326, 434, 568, 610, 756, 895]],
  //   };
  //   const optionsWebsiteViewsChart = {
  //     axisX: {
  //       showGrid: false,
  //     },
  //     low: 0,
  //     high: 1000,
  //     chartPadding: { top: 0, right: 5, bottom: 0, left: 0 },
  //   };
  //   const responsiveOptions: any = [
  //     [
  //       "screen and (max-width: 640px)",
  //       {
  //         seriesBarDistance: 5,
  //         axisX: {
  //           labelInterpolationFnc: function (value) {
  //             return value[0];
  //           },
  //         },
  //       },
  //     ],
  //   ];
  //   const websiteViewsChart = new Chartist.Bar(
  //     "#websiteViewsChart",
  //     dataWebsiteViewsChart,
  //     optionsWebsiteViewsChart,
  //     responsiveOptions
  //   );

  //   this.startAnimationForBarChart(websiteViewsChart);

  //   $("#worldMap").vectorMap({
  //     map: "world_en",
  //     backgroundColor: "transparent",
  //     borderColor: "#818181",
  //     borderOpacity: 0.25,
  //     borderWidth: 1,
  //     color: "#b3b3b3",
  //     enableZoom: true,
  //     hoverColor: "#eee",
  //     hoverOpacity: null,
  //     normalizeFunction: "linear",
  //     scaleColors: ["#b6d6ff", "#005ace"],
  //     selectedColor: "#c9dfaf",
  //     selectedRegions: null,
  //     showTooltip: true,
  //     onRegionClick: function (element, code, region) {
  //       var message =
  //         'You clicked "' +
  //         region +
  //         '" which has the code: ' +
  //         code.toUpperCase();

  //       alert(message);
  //     },
  //   });
  // }
  // ngAfterViewInit() {
  //   const breakCards = true;
  //   if (breakCards === true) {
  //     // We break the cards headers if there is too much stress on them :-)
  //     $('[data-header-animation="true"]').each(function () {
  //       const $fix_button = $(this);
  //       const $card = $(this).parent(".card");
  //       $card.find(".fix-broken-card").click(function () {
  //         const $header = $(this)
  //           .parent()
  //           .parent()
  //           .siblings(".card-header, .card-image");
  //         $header.removeClass("hinge").addClass("fadeInDown");

  //         $card.attr("data-count", 0);

  //         setTimeout(function () {
  //           $header.removeClass("fadeInDown animate");
  //         }, 480);
  //       });

  //       $card.mouseenter(function () {
  //         const $this = $(this);
  //         const hover_count = parseInt($this.attr("data-count"), 10) + 1 || 0;
  //         $this.attr("data-count", hover_count);
  //         if (hover_count >= 20) {
  //           $(this)
  //             .children(".card-header, .card-image")
  //             .addClass("hinge animated");
  //         }
  //       });
  //     });
  //   }
  // }
}
