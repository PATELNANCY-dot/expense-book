login() {

  const user = {
    email: this.email,
    password: this.password
  };

  this.http.post<any>(
    'https://expensetracker-mpmh.onrender.com/api/ExpenseTracker/login',
    user
  ).subscribe({

    next: (res) => {

      // 🚨 SAFETY CHECK (VERY IMPORTANT)
      if (!res || !res.id) {
        alert("Login failed: invalid response");
        return;
      }

      sessionStorage.setItem('user', JSON.stringify(res));

      const userId = res.id;

      const sessionTheme = sessionStorage.getItem('theme');

      if (sessionTheme) {

        document.body.classList.toggle(
          'dark-mode',
          sessionTheme === 'dark'
        );

        const payload = {
          userId: userId,
          darkMode: sessionTheme === 'dark'
        };

        this.http.post(
          'https://expensetracker-mpmh.onrender.com/api/ExpenseTracker/save-theme',
          payload
        ).subscribe();

        alert("Login successful!");
        this.router.navigate(['/home']);
      }
      else {

        this.http.get<any>(
          `https://expensetracker-mpmh.onrender.com/api/ExpenseTracker/get-theme/${userId}`
        ).subscribe({

          next: (themeRes) => {

            const isDark = themeRes?.darkMode ?? false;

            sessionStorage.setItem('theme', isDark ? 'dark' : 'light');

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

    error: (err) => {
      console.error(err);
      alert("Invalid login or server error!");
    }
  });
}
