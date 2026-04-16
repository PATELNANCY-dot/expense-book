import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';

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

  //  NOTES FIELD ADDED
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

  ngOnInit() {

    const userData = sessionStorage.getItem('user');

    if (!userData) {
      this.router.navigate(['/login']);
      return;
    }

    this.user = JSON.parse(userData);

    const userId = this.user.id;

    if (userId) {
      this.loadExpenses(userId);
      this.loadDashboard(userId);
    }
  }

  loadExpenses(userId: number) {

    this.http.get<any[]>(
      `https://localhost:7042/api/ExpenseTracker/get-expenses/${userId}`
    ).subscribe({
      next: (res) => {

        // ✅ NOTES FIELD MAPPED
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
      },
      error: (err) => {
        console.log("API ERROR:", err);
      }
    });
  }

  deleteExpense(id: number) {

    if (!id) {
      console.log("Invalid ID");
      return;
    }

    this.http.delete(
      `https://localhost:7042/api/ExpenseTracker/delete-expense/${id}`
    ).subscribe({
      next: () => {
        alert("Deleted!");
        this.loadExpenses(this.user.id);
      },
      error: (err) => console.log(err)
    });
  }

  logout() {
    sessionStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  openEdit(item: any) {

    this.showEditPopup = true;

    this.editData = {
      id: item.id,
      title: item.title,
      amount: item.amount,
      category: item.category,
      notes: item.notes,

      expenseDate: item.expenseDate
        ? item.expenseDate.split('T')[0]
        : ''
    };
  }

  closePopup() {
    this.showEditPopup = false;
  }

  updateExpense() {

    this.http.put(
      `https://localhost:7042/api/ExpenseTracker/update-expense/${this.editData.id}`,
      this.editData
    ).subscribe({
      next: () => {

        alert("Updated Successfully!");

        this.showEditPopup = false;

        this.loadExpenses(this.user.id);

        this.closePopup();
      },
      error: (err) => console.log(err)
    });

  }

  loadDashboard(userId: number) {

    this.http.get<any>(
      `https://localhost:7042/api/ExpenseTracker/dashboard/${userId}`
    ).subscribe({
      next: (res) => {

        this.totalIncome = res.totalIncome;
        this.totalExpense = res.totalExpense;
        this.balance = res.balance;

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log("Dashboard error:", err);
      }
    });
  }

  closeIncomeModal() {
    this.showIncomeModal = false;
  }

  addIncome() {

    const user = JSON.parse(sessionStorage.getItem('user') || '{}');

    const data = {
      ...this.income,
      userId: user.id || user.Id
    };

    this.http.post(
      'https://localhost:7042/api/ExpenseTracker/add-income',
      data
    ).subscribe({
      next: () => {

        alert("Income Saved!");

        this.showIncomeModal = false;

        this.loadDashboard(user.id);
      },
      error: (err) => console.log(err)
    });
  }
  openIncomeModal() {

    this.showIncomeModal = true;   

    const userId = this.user.id;

    this.http.get<any[]>(
      `https://localhost:7042/api/ExpenseTracker/get-income/${userId}`
    ).subscribe(res => {

      this.incomes = res;

      this.cdr.detectChanges();
    });
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
        `https://localhost:7042/api/ExpenseTracker/update-income/${this.income.id}`,
        data
      ).subscribe(() => {

        alert("Income Updated");

        this.openIncomeModal();

        this.resetIncomeForm();

        this.loadDashboard(user.id);
      });

    }
    else {

      this.http.post(
        `https://localhost:7042/api/ExpenseTracker/add-income`,
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
      `https://localhost:7042/api/ExpenseTracker/delete-income/${id}`
    ).subscribe(() => {

      alert("Income Deleted");

      this.openIncomeModal();

      this.loadDashboard(this.user.id);
      this.cdr.detectChanges();
    });
  }
}
