import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  email: string = '';
  password: string = '';
  showPassword: boolean = false;

  //  LOCAL API BASE URL
  apiUrl = "https://localhost:7042/api/ExpenseTracker";

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  login() {

    const user = {
      email: this.email,
      password: this.password
    };

    // LOGIN API (LOCAL)
    this.http.post<any>(`${this.apiUrl}/login`, user)
      .subscribe({

        next: (res) => {

          console.log("LOGIN RESPONSE:", res);

          if (!res?.id) {
            alert("Invalid login response");
            return;
          }

          const userId = res.id;

          // Save user
          sessionStorage.setItem('user', JSON.stringify(res));

          // Get theme (LOCAL)
          this.http.get<any>(`${this.apiUrl}/get-theme/${userId}`)
            .subscribe({

              next: (themeRes) => {

                const isDark = themeRes?.darkMode ?? false;

                const theme = isDark ? 'dark' : 'light';
                sessionStorage.setItem('theme', theme);

                document.body.classList.toggle('dark-mode', isDark);

                // Optional sync back
                this.http.post(`${this.apiUrl}/save-theme`, {
                  userId: userId,
                  darkMode: isDark
                }).subscribe();

                alert("Login successful!");
                this.router.navigate(['/home']);
              },

              error: () => {

                sessionStorage.setItem('theme', 'light');
                document.body.classList.remove('dark-mode');

                alert("Login successful!");
                this.router.navigate(['/home']);
              }

            });

        },

        error: (err) => {
          console.error("Login error:", err);
          alert("Invalid login!");
        }

      });
  }
}
