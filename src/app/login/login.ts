import { Component } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  email: string = '';
  password: string = '';
  showPassword: boolean = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
  constructor(
    private http: HttpClient,
    private router: Router
  ) { }


  login() {

    const user = {
      email: this.email,
      password: this.password
    };

    this.http.post('https://localhost:7042/api/ExpenseTracker/login', user)
      .subscribe({
        next: (res: any) => {

          console.log(res);

          // =========================
          // 1. STORE USER
          // =========================
          sessionStorage.setItem('user', JSON.stringify(res.data));

          const userId = res.data.id;

          // =========================
          // 2. FETCH THEME FROM DB (LIKE SETTINGS)
          // =========================
          this.http.get<any>(
            `https://localhost:7042/api/ExpenseTracker/get-theme/${userId}`
          ).subscribe({
            next: (themeRes) => {

              const isDark = themeRes?.darkMode ?? false;

              const theme = isDark ? 'dark' : 'light';

              // store theme
              sessionStorage.setItem('theme', theme);

              // apply theme instantly
              document.body.classList.toggle('dark-mode', isDark);

              alert("Login successful!");

              this.router.navigate(['/home']);
            },

            error: (err) => {

              console.log("Theme fetch error:", err);

              // fallback theme
              sessionStorage.setItem('theme', 'light');
              document.body.classList.remove('dark-mode');

              alert("Login successful!");

              this.router.navigate(['/home']);
            }
          });

        },

        error: (err) => {
          console.log(err);
          alert("Invalid login!");
        }
      });
  }
}
