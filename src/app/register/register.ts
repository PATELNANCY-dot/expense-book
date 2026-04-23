import { Component } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

  apiUrl = "https://expensetracker-mpmh.onrender.com/api/ExpenseTracker";

  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  register() {

    // VALIDATION
    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      alert("All fields are required!");
      return;
    }

    if (this.password !== this.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const user = {
      name: this.name.trim(),
      email: this.email.trim(),
      password: this.password
    };

    this.http.post(
      `${this.apiUrl}/register`,
      user
    ).subscribe({
      next: (res) => {
        alert("Registration successful!");
        console.log(res);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.log("Register error:", err);
        alert("Registration failed!");
      }
    });
  }
}
