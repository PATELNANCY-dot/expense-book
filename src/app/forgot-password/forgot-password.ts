import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],

  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})

export class ForgotPassword {

  email = '';
  otp = '';
  password = '';
  confirmPassword = '';
  isSendingOtp = false;
  isVerifyingOtp = false;
  isResendingOtp = false;
  step = 1;

  showPassword = false;
  showConfirmPassword = false;

  api = 'https://localhost:7042/api/ExpenseTracker';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cd: ChangeDetectorRef
  ) { }


  change() {
    this.cd.detectChanges();
  }
  // SEND OTP

  sendOtp() {

    if (this.isSendingOtp) return;

    this.isSendingOtp = true;

    this.http.post(
      `${this.api}/send-otp?email=${this.email}`,
      {}
    ).subscribe({

      next: (res: any) => {

        console.log(res);

        this.step = 2;

        this.isSendingOtp = false;

        this.change();

        

        alert('OTP Sent Successfully');
      },

      error: (error) => {

        console.log(error);

        this.isSendingOtp = false;

        alert('Failed to send OTP');

        this.change();
      }

    });
  }

  // VERIFY OTP

  verifyOtp() {

    if (this.isVerifyingOtp) return;

    this.isVerifyingOtp = true;

    this.http.post(
      `${this.api}/verify-otp?email=${this.email}&otp=${this.otp}`,
      {}
    ).subscribe({

      next: (res: any) => {

        console.log(res);

        this.step = 3;

       

        this.isVerifyingOtp = false;
        this.change();
        alert('OTP Verified');
        this.change();
      },

      error: (error) => {

        console.log(error);

        this.isVerifyingOtp = false;

        alert('Invalid OTP');
      }

    });
  }


  resendOtp() {

    if (this.isResendingOtp) return;

    this.isResendingOtp = true;

    this.http.post(
      `${this.api}/send-otp?email=${this.email}`,
      {}
    ).subscribe({

      next: (res: any) => {

        console.log(res);

        this.isResendingOtp = false;
        this.change();
        alert('OTP Resent Successfully');
      },

      error: (error) => {

        console.log(error);

        this.isResendingOtp = false;

        alert('Failed to resend OTP');
      }

    });
  }

  // RESET PASSWORD

  resetPassword() {

    if (this.password !== this.confirmPassword) {

      alert('Passwords do not match');

      return;
    }

    this.http.put(
      `${this.api}/reset-password?email=${this.email}&password=${this.password}`,
      {}
    ).subscribe({

      next: (res: any) => {

        console.log(res);

        alert('Password Reset Successful');

        this.router.navigate(['/login']);
      },

      error: (error) => {

        console.log(error);

        alert('Failed to reset password');
      }

    });
  }

  togglePassword() {

    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {

    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
