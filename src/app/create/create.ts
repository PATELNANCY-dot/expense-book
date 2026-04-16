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

  expense = {
    title: '',
    amount: 0,
    category: '',
    expenseDate: '',
    notes: '',   
    userId: 0
  };

  constructor(private http: HttpClient, private router: Router) { }

  addExpense() {

    const user = JSON.parse(sessionStorage.getItem('user') || '{}');

    this.expense.userId = user.id || user.Id;

    this.http.post(
      'https://localhost:7042/api/ExpenseTracker/add-expense',
      this.expense
    ).subscribe({
      next: () => {
        alert("Expense Added Successfully!");
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.log(err);
      }
    });
  }
}
