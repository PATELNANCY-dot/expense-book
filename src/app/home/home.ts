import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {

  incomes: any[] = [];
  editIncomeMode = false;

  showChart = false;
  chart: any;

  income = {
    id: 0,
    title: '',
    amount: 0,
    incomeDate: ''
  };

  showIncomeModal = false;

  expenses: any[] = [];
  totalExpense: number = 0;

  showEditPopup = false;
  user: any;

  totalIncome: number = 0;
  balance: number = 0;

  editData: any = {
    id: 0,
    title: '',
    amount: 0,
    category: '',
    expenseDate: '',
    notes: ''
  };



  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  // INIT
  ngOnInit() {

    const userData = sessionStorage.getItem('user');

    if (!userData) {
      this.router.navigate(['/login']);
      return;
    }

    this.user = JSON.parse(userData);

    this.loadExpenses(this.user.id);
    this.loadDashboard(this.user.id);
  }

  //LOGOUT
  logout() {
    sessionStorage.removeItem('user');
    this.router.navigate(['/main-home']);
  }

  // EXPENSES 
  loadExpenses(userId: number) {

    this.http.get<any[]>(
      `https://expensetracker-mpmh.onrender.com/api/ExpenseTracker/get-expenses/${userId}`
    ).subscribe(res => {

      this.expenses = res.map(x => ({
        id: x.id,
        title: x.title,
        amount: x.amount,
        category: x.category,
        expenseDate: x.expenseDate,
        notes: x.notes
      }));

      this.totalExpense = this.expenses.reduce(
        (sum, x) => sum + Number(x.amount || 0),
        0
      );

      this.cdr.detectChanges();
    });
  }

  deleteExpense(id: number) {

    if (!id) return;

    this.http.delete(
      `https://expensetracker-mpmh.onrender.com/api/ExpenseTracker/delete-expense/${id}`
    ).subscribe(() => {

      alert("Deleted!");
      this.loadExpenses(this.user.id);
    });
  }

  openEdit(item: any) {

    this.showEditPopup = true;

    this.editData = {
      id: item.id,
      title: item.title,
      amount: item.amount,
      category: item.category,
      notes: item.notes,
      expenseDate: item.expenseDate ? item.expenseDate.split('T')[0] : ''
    };
  }

  closePopup() {
    this.showEditPopup = false;
  }

  updateExpense() {

    this.http.put(
      `https://expensetracker-mpmh.onrender.com/api/ExpenseTracker/update-expense/${this.editData.id}`,
      this.editData
    ).subscribe(() => {

      alert("Updated Successfully!");
      this.showEditPopup = false;
      this.loadExpenses(this.user.id);
      this.closePopup();
    });
  }

  // DASHBOARD 
  loadDashboard(userId: number) {

   this.http.get(
  `https://expensetracker-mpmh.onrender.com/api/ExpenseTracker/dashboard-summary/${userId}`
).subscribe(res => {

      this.totalIncome = res.totalIncome;
      this.totalExpense = res.totalExpense;
      this.balance = res.balance;

      this.cdr.detectChanges();
    });
  }

  //INCOME 
  openIncomeModal() {

    this.showIncomeModal = true;

    this.http.get<any[]>(
      `https://expensetracker-mpmh.onrender.com/api/ExpenseTracker/get-income/${this.user.id}`
    ).subscribe(res => {

      this.incomes = res;
      this.cdr.detectChanges();
    });
  }

  closeIncomeModal() {
    this.showIncomeModal = false;
    this.resetIncomeForm();
  }

  editIncome(item: any) {

    this.editIncomeMode = true;

    this.income = {
      id: item.id,
      title: item.title,
      amount: item.amount,
      incomeDate: item.incomeDate.split('T')[0]
    };

    this.cdr.detectChanges();
  }

  saveIncome() {

    const user = JSON.parse(sessionStorage.getItem('user') || '{}');

    const data = {
      ...this.income,
      userId: user.id
    };

    if (this.editIncomeMode) {

      this.http.put(
        `https://expensetracker-mpmh.onrender.com/api/ExpenseTracker/update-income/${this.income.id}`,
        data
      ).subscribe(() => {

        alert("Income Updated");
        this.openIncomeModal();
        this.resetIncomeForm();
        this.loadDashboard(user.id);
      });

    } else {

      this.http.post(
        `https://expensetracker-mpmh.onrender.com/api/ExpenseTracker/add-income`,
        data
      ).subscribe(() => {

        alert("Income Added");
        this.openIncomeModal();
        this.resetIncomeForm();
        this.loadDashboard(user.id);
      });
    }
  }

  resetIncomeForm() {

    this.editIncomeMode = false;

    this.income = {
      id: 0,
      title: '',
      amount: 0,
      incomeDate: ''
    };
  }

  deleteIncome(id: number) {

    if (!confirm("Delete this income?")) return;

    this.http.delete(
      `https://expensetracker-mpmh.onrender.com/api/ExpenseTracker/delete-income/${id}`
    ).subscribe(() => {

      alert("Income Deleted");
      this.openIncomeModal();
      this.loadDashboard(this.user.id);
      this.cdr.detectChanges();
    });
  }

  // CHART 
  openChart() {

    this.showChart = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.renderChart();
    }, 300);
  }

  closeChart() {
    this.showChart = false;

    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  renderChart() {

    const canvas = document.getElementById('expenseChart') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const data = this.calculateMonthlyExpenses();

    this.chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Expenses (₹)',
          data: data.data,
          backgroundColor: '#22c55e'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  calculateMonthlyExpenses() {

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = new Array(12).fill(0);

    this.expenses.forEach(e => {
      const m = new Date(e.expenseDate).getMonth();
      data[m] += Number(e.amount);
    });

    return { labels: months, data };
  }

  openPage() {
    window.open('/main-home', '_blank');
  }
}
