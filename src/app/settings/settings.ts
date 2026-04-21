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

  apiUrl = "https://expensetracker-pd7u.onrender.com/api/ExpenseTracker";
  theme: string = 'light';
  userId: number = 0;

  settings = {
    id: 0,
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {


    // 1. GET USER

    const user = sessionStorage.getItem("user");

    if (!user) {
      console.error("User not found");
      return;
    }

    const parsedUser = JSON.parse(user);
    this.userId = Number(parsedUser?.id);

    console.log("Logged User ID:", this.userId);

    this.getUserProfile();


    // 2. LOAD THEME FROM SESSION FIRST

    const sessionTheme = sessionStorage.getItem('theme');

    if (sessionTheme) {
      this.theme = sessionTheme;
      document.body.classList.toggle('dark-mode', this.theme === 'dark');
    }


    // 3. OVERRIDE WITH DB THEME

    this.http.get<any>(
      `${this.apiUrl}/get-theme/${this.userId}`
    ).subscribe({
      next: (res) => {

        const isDark = res?.darkMode ?? false;

        this.theme = isDark ? 'dark' : 'light';

        sessionStorage.setItem('theme', this.theme);

        document.body.classList.toggle('dark-mode', isDark);
      },

      error: (err) => {
        console.log("Theme API error:", err);
      }
    });
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
        error: (err) => console.log(err)
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
        error: (err) => console.log(err)
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
        error: (err) => console.log(err)
      });
  }


  // CLEAR DATA

  clearData() {

    if (confirm("Delete all expenses and income?")) {

      this.http.delete(`${this.apiUrl}/clear-user-data/${this.userId}`)
        .subscribe({
          next: () => alert("All Data Deleted"),
          error: (err) => console.log(err)
        });
    }
  }


  // TOGGLE THEME

  toggleTheme() {

    this.theme = this.theme === 'light' ? 'dark' : 'light';

    // session storage (current tab)
    sessionStorage.setItem('theme', this.theme);

    // apply UI
    document.body.classList.toggle('dark-mode', this.theme === 'dark');

    // save to DB
    const payload = {
      userId: this.userId,
      darkMode: this.theme === 'dark'
    };

    this.http.post(
      `${this.apiUrl}/save-theme`,
      payload
    ).subscribe();
  }
}
