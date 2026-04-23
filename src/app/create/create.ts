import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './create.html',
  styleUrl: './create.css',
})
export class Create {

  apiUrl = "https://expensetracker-mpmh.onrender.com/api/ExpenseTracker";

  expense = {
    title: '',
    amount: 0,
    category: '',
    expenseDate: '',
    notes: '',
    userId: 0
  };

  constructor(private http: HttpClient, private router: Router) {}

  addExpense() {

    const userData = sessionStorage.getItem('user');

    if (!userData) {
      alert("User not logged in");
      this.router.navigate(['/login']);
      return;
    }

    const user = JSON.parse(userData);

    if (!user?.id) {
      alert("Invalid user session");
      return;
    }

    this.expense.userId = user.id;

    // Optional safety: ensure date is not empty
    if (!this.expense.expenseDate) {
      this.expense.expenseDate = new Date().toISOString();
    }

    this.http.post(
      `${this.apiUrl}/add-expense`,
      this.expense
    ).subscribe({
      next: () => {
        alert("Expense Added Successfully!");
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.log("Add expense error:", err);
        alert("Failed to add expense");
      }
    });
  }
}
