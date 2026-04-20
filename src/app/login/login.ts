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

        
          sessionStorage.setItem('user', JSON.stringify(res.data));

          alert("Login successful!");

         
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.log(err);
          alert("Invalid login!");
        }
      });
  }
}
