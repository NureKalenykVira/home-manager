import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [ FormsModule ]
})
export class RegisterComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  confirmPassword: string = '';

  constructor(private authService: AuthService, private http: HttpClient, private router: Router) {}

  register(): void {
    const data = {
      userName: this.username,
      email: this.email,
      password: this.password
    };

    this.authService.register(data).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Помилка реєстрації: ' + (err.error?.message || 'невідома');
      }
    });
  }

  goTo() {
    this.router.navigate(['/auth/login']);
  }
}
