import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  email: string = '';
  password: string = '';
  showPassword: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  login() {

    const user = {
      email: this.email,
      password: this.password
    };

    this.http.post<any>(
      'https://expensetracker-mpmh.onrender.com/api/ExpenseTracker/login',
      user
    ).subscribe({
    next: (res) => {

  sessionStorage.setItem('user', JSON.stringify(res));

  const userId = res.id;

  const sessionTheme = sessionStorage.getItem('theme');

  if (sessionTheme) {

    document.body.classList.toggle('dark-mode', sessionTheme === 'dark');

    this.http.post(
      'https://expensetracker-mpmh.onrender.com/api/ExpenseTracker/save-theme',
      {
        userId: userId,
        darkMode: sessionTheme === 'dark'
      }
    ).subscribe();

    this.router.navigate(['/home']);
  }
  else {

    this.http.get<any>(
      `https://expensetracker-mpmh.onrender.com/api/ExpenseTracker/get-theme/${userId}`
    ).subscribe({
      next: (themeRes) => {

        const isDark = themeRes?.darkMode ?? false;

        sessionStorage.setItem('theme', isDark ? 'dark' : 'light');
        document.body.classList.toggle('dark-mode', isDark);

        this.router.navigate(['/home']);
      },
      error: () => {
        this.router.navigate(['/home']);
      }
    });

  }

},
      error: () => {
        alert("Invalid login!");
      }
    });
  }
}
