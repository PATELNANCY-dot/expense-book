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

  apiUrl = "https://expensetracker-mpmh.onrender.com/api/ExpenseTracker";

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
  ) {}

  ngOnInit() {

    const user = sessionStorage.getItem("user");

    if (!user) {
      console.error("User not found");
      this.router.navigate(['/login']);
      return;
    }

    const parsedUser = JSON.parse(user);

    if (!parsedUser?.id) {
      console.error("Invalid user data");
      return;
    }

    this.userId = Number(parsedUser.id);

    this.getUserProfile();

    // Load theme from session first
    const sessionTheme = sessionStorage.getItem('theme');

    if (sessionTheme) {
      this.theme = sessionTheme;
      document.body.classList.toggle('dark-mode', this.theme === 'dark');
    }

    // Override with DB theme
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

  // GET USER PROFILE (FIXED ROUTE)
  getUserProfile() {

    this.http.get<any>(
      `${this.apiUrl}/user-profile/${this.userId}`
    ).subscribe({
      next: (res) => {

        this.settings.id = res.id;
        this.settings.name = res.name;
        this.settings.email = res.email;

        this.cdr.detectChanges();
      },
      error: (err) => console.log(err)
    });
  }

  // UPDATE PROFILE (⚠️ MUST EXIST IN BACKEND)
  updateProfile() {

    const payload = {
      id: this.userId,
      name: this.settings.name?.trim(),
      email: this.settings.email?.trim()
    };

    this.http.put(
      `${this.apiUrl}/update-profile`,
      payload
    ).subscribe({
      next: () => alert("Profile Updated"),
      error: (err) => console.log(err)
    });
  }

  // CHANGE PASSWORD (⚠️ MUST EXIST IN BACKEND)
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

    this.http.put(
      `${this.apiUrl}/change-password`,
      payload
    ).subscribe({
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

  // CLEAR DATA (FIXED ROUTE)
  clearData() {

    if (confirm("Delete all expenses and income?")) {

      this.http.delete(
        `${this.apiUrl}/clear-data/${this.userId}`
      ).subscribe({
        next: () => alert("All Data Deleted"),
        error: (err) => console.log(err)
      });
    }
  }

  // TOGGLE THEME
  toggleTheme() {

    this.theme = this.theme === 'light' ? 'dark' : 'light';

    sessionStorage.setItem('theme', this.theme);

    document.body.classList.toggle('dark-mode', this.theme === 'dark');

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
