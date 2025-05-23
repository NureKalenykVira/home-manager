import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-page',
  standalone: true,
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  imports: [CommonModule, RouterModule]
})
export class HomePageComponent {
  familyName: string | null = null; // Це буде витягуватись з бекенду пізніше
  selectedTab: string = 'tasks';
  hasFamily = false;
  joinCode: string = '';
  isModalOpen = false;
  copied = false;
  userName: string = '';

  constructor(private router: Router) {}

  ngOnInit() {
    this.hasFamily = !!localStorage.getItem('familyId');
    this.joinCode = localStorage.getItem('joinCode') || '';
    this.userName = localStorage.getItem('userName') || '';
  }

  openFamilyModal() {
    this.isModalOpen = true;
  }

  leaveFamily() {
    localStorage.removeItem('familyId');
    localStorage.removeItem('joinCode');
    this.isModalOpen = false;
    window.location.reload();
  }

  copyCode() {
    navigator.clipboard.writeText(this.joinCode).then(() => {
      this.copied = true;
      setTimeout(() => this.copied = false, 2500);
    });
  }

  navigateToFamily() {
    this.router.navigate(['/family/join']);
  }

  navigateToProfile() {
    // Перехід на профіль користувача
    this.router.navigate(['/profile']);
  }

  selectTab(tab: string) {
    this.selectedTab = tab;
  }
}
