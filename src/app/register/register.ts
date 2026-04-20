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

  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
  constructor(private http: HttpClient, private router: Router) { }

  register() {

    // basic validation
    if (this.password !== this.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const user = {
      name: this.name,
      email: this.email,
      password: this.password
    };

    this.http.post('https://localhost:7042/api/ExpenseTracker/register', user)
      .subscribe({
        next: (res) => {
          alert("Registration successful!");
          console.log(res);
          this.router.navigate(['/login']);
        },
        error: (err) => {
          alert("Registration failed!");
          console.log(err);
        }
      });
  }
}
