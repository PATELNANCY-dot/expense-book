import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './main-home.html',
  styleUrl: './main-home.css',
})
export class MainHome implements OnInit {

  theme: string = 'light';

  ngOnInit() {
    const savedTheme = sessionStorage.getItem('theme');

    if (savedTheme) {
      this.theme = savedTheme;
    }
    document.body.classList.toggle('dark-mode', this.theme === 'dark');
  }

  toggleTheme() {

    this.theme = this.theme === 'light' ? 'dark' : 'light';

    sessionStorage.setItem('theme', this.theme);

   
    document.body.classList.toggle('dark-mode', this.theme === 'dark');
  }

}
