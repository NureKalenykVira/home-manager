import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FamilyService } from '../../services/family.service';

@Component({
  selector: 'app-join-family',
  standalone: true,
  templateUrl: './join-family.component.html',
  styleUrls: ['./join-family.component.scss'],
  imports: [CommonModule, RouterModule, ReactiveFormsModule, HttpClientModule]
})
export class JoinFamilyComponent {
  familyForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private familyService: FamilyService,
    private router: Router
  ) {
    this.familyForm = this.fb.group({
      joinCode: ['', Validators.required],
      name: ['', Validators.required],
      description: ['']
    });
  }

  get joinCode() {
    return this.familyForm.get('joinCode');
  }

  get name() {
    return this.familyForm.get('name');
  }

  joinFamily() {
    if (this.joinCode?.invalid) {
      this.joinCode.markAsTouched();
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) return;

    this.familyService.joinFamily({
      familyCode: this.joinCode?.value,
      userId: userId
    }).subscribe({
      next: () => {
        localStorage.setItem('familyId', 'joined');
        localStorage.setItem('joinCode', this.joinCode?.value || '');
        this.router.navigate(['/dashboard']);
      },
      error: () => this.joinCode?.setErrors({ invalidCode: true })
    });
  }

  createFamily() {
    if (this.name?.invalid) {
      this.name.markAsTouched();
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) return;

    this.familyService.createFamily({
      familyName: this.name?.value,
      familyDescription: this.familyForm.get('description')?.value,
      userId: userId
    }).subscribe((res) => {
      localStorage.setItem('familyId', res.familyId);
      localStorage.setItem('joinCode', res.joinCode);
      this.router.navigate(['/dashboard']);
    });
  }
}
