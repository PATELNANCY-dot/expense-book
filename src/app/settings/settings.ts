import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core'; 

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css']
})
export class Settings implements OnInit {

  apiUrl = "https://localhost:7042/api/ExpenseTracker";
  theme: string = 'light';


  settings = {
    id: 0,
    name: '',
    email: '',

    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  userId: number = 0;

  constructor(private http: HttpClient, private router: Router, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme) {
      this.theme = savedTheme;
      this.applyTheme();
    }
    const user = sessionStorage.getItem("user");

    if (user) {
      const parsedUser = JSON.parse(user);

      // ✅ FIX: ensure number type
      this.userId = Number(parsedUser?.id);

      console.log("Logged User ID:", this.userId);
    }

    if (this.userId) {
      this.getUserProfile();
    } else {
      console.error("User ID not found in session storage");
    }
  }

  // GET USER PROFILE
  getUserProfile() {

    this.http.get<any>(`${this.apiUrl}/get-user-profile/${this.userId}`)
      .subscribe({
        next: (res) => {
          this.settings.id = res.id;
          this.settings.name = res.name;
          this.settings.email = res.email;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.log("Get profile error:", err);
        }
      });
  }

  // UPDATE PROFILE
  updateProfile() {

    const payload = {
      id: this.userId,
      name: this.settings.name?.trim(),
      email: this.settings.email?.trim()
    };

    this.http.put(`${this.apiUrl}/update-profile`, payload)
      .subscribe({
        next: () => alert("Profile Updated"),
        error: (err) => console.log(err.error)
      });
  }

  // CHANGE PASSWORD
  changePassword() {

    if (!this.settings.currentPassword ||
      !this.settings.newPassword ||
      !this.settings.confirmPassword) {
      alert("All fields required");
      return;
    }

    if (this.settings.newPassword !== this.settings.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const payload = {
      id: this.userId,
      currentPassword: this.settings.currentPassword,
      newPassword: this.settings.newPassword
    };

    this.http.put(`${this.apiUrl}/change-password`, payload)
      .subscribe({
        next: () => {
          alert("Password Changed");

          this.settings.currentPassword = '';
          this.settings.newPassword = '';
          this.settings.confirmPassword = '';
          this.router.navigate(['/login']);
        },
        error: (err) => console.log(err.error)
      });
  }

  // CLEAR DATA
  clearData() {

    if (confirm("Delete all expenses and income?")) {

      this.http.delete(`${this.apiUrl}/clear-user-data/${this.userId}`)
        .subscribe({
          next: () => {
            alert("All Data Deleted");
          },
          error: (err) => {
            console.log("Delete Error:", err.error);
          }
        });
    }
  }

  toggleTheme() {

    this.theme = this.theme === 'light' ? 'dark' : 'light';

    localStorage.setItem('theme', this.theme);

    this.applyTheme();
  }

  applyTheme() {

    if (this.theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }
}
