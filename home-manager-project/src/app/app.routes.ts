import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent) },
  { path: 'home', loadComponent: () => import('./home/home-page/home-page.component').then(m => m.HomePageComponent) },
  { path: 'family/join', loadComponent: () => import('./family/join-family/join-family.component').then(m => m.JoinFamilyComponent) },
  { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'dashboard/tasks', loadComponent: () => import('./dashboard/task-list/task-list.component').then(m => m.TaskListComponent) },
  { path: 'dashboard/shopping', loadComponent: () => import('./dashboard/shopping-list/shopping-list.component').then(m => m.ShoppingListComponent) },
  { path: 'dashboard/calendar', loadComponent: () => import('./dashboard/calendar/calendar.component').then(m => m.CalendarComponent) },
  { path: '**', redirectTo: '/login' }
];
