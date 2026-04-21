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

    this.http.post('https://expensetracker-pd7u.onrender.com/api/ExpenseTracker/login', user)
      .subscribe({
        next: (res: any) => {

          sessionStorage.setItem('user', JSON.stringify(res.data));

          const userId = res.data.id;

          // CHECK IF THEME ALREADY EXISTS

          const sessionTheme = sessionStorage.getItem('theme');

          if (sessionTheme) {

            // apply theme immediately
            document.body.classList.toggle('dark-mode', sessionTheme === 'dark');

            // SAVE THEME TO DATABASE
            const payload = {
              userId: userId,
              darkMode: sessionTheme === 'dark'
            };

            this.http.post(
              'https://expensetracker-pd7u.onrender.com/api/ExpenseTracker/save-theme',
              payload
            ).subscribe();

            alert("Login successful!");
            this.router.navigate(['/home']);
          }

          else {

            // IF NO THEME IN SESSION → LOAD FROM DB

            this.http.get<any>(
              `https://expensetracker-pd7u.onrender.com/api/ExpenseTracker/get-theme/${userId}`
            ).subscribe({

              next: (themeRes) => {

                const isDark = themeRes?.darkMode ?? false;
                const theme = isDark ? 'dark' : 'light';

                sessionStorage.setItem('theme', theme);

                document.body.classList.toggle('dark-mode', isDark);

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
          }

        },

        error: () => {
          alert("Invalid login!");
        }
      });
  }
}
