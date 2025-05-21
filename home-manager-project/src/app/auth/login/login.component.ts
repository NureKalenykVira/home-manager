import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [ FormsModule ]
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private http: HttpClient, private router: Router) {}

  login(): void {
    const data = {
      email: this.email,
      password: this.password
    };

    this.authService.login(data).subscribe({
      next: (response) => {
        localStorage.setItem('userId', response.userId);
        localStorage.setItem('familyId', response.familyId);
        localStorage.setItem('userName', response.userName);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Помилка входу: ' + (err.error?.message || 'невідома');
      }
    });
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }
}
