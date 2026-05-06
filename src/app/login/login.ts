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

<<<<<<< HEAD
  this.http.post<any>(
    'https://expensetracker-mpmh.onrender.com/api/ExpenseTracker/login',
    user
  ).subscribe({
    next: (res) => {

      console.log("LOGIN RESPONSE:", res);

      if (!res?.id) {
        alert("Invalid login response");
        return;
      }

      // SAVE USER
      sessionStorage.setItem('user', JSON.stringify(res));
=======
    this.http.post('https://localhost:7042/api/ExpenseTracker/login', user)
      .subscribe({

        next: (res: any) => {

          console.log("LOGIN RESPONSE:", res);

          // ✅ SAFE USER EXTRACTION (handles different API shapes)
          const loggedUser = res?.data ?? res?.user ?? res;

          if (!loggedUser || !loggedUser.id) {
            alert("Invalid response from server!");
            return;
          }

          const userId = loggedUser.id;

          sessionStorage.setItem('user', JSON.stringify(loggedUser));
>>>>>>> 3b6dfb8 (small changes)

      const userId = res.id;

      // LOAD THEME FIRST
      this.http.get<any>(
        `https://expensetracker-mpmh.onrender.com/api/ExpenseTracker/get-theme/${userId}`
      ).subscribe({
        next: (themeRes) => {

          const isDark = themeRes?.darkMode ?? false;

          sessionStorage.setItem('theme', isDark ? 'dark' : 'light');

          document.body.classList.toggle('dark-mode', isDark);

          // SAVE THEME BACK (optional sync)
          this.http.post(
            'https://expensetracker-mpmh.onrender.com/api/ExpenseTracker/save-theme',
            {
              userId: userId,
<<<<<<< HEAD
              darkMode: isDark
            }
          ).subscribe();
=======
              darkMode: sessionTheme === 'dark'
            };

            this.http.post(
              'https://localhost:7042/api/ExpenseTracker/save-theme',
              payload
            ).subscribe();

            alert("Login successful!");
            this.router.navigate(['/home']);
          }

          else {

            // LOAD THEME FROM DB
            this.http.get<any>(
              `https://localhost:7042/api/ExpenseTracker/get-theme/${userId}`
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
>>>>>>> 3b6dfb8 (small changes)

          this.router.navigate(['/home']);
        },

<<<<<<< HEAD
        error: () => {
          this.router.navigate(['/home']);
=======
        error: (err) => {
          console.error("Login error:", err);
          alert("Invalid login!");
>>>>>>> 3b6dfb8 (small changes)
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
