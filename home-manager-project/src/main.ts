import '@angular/forms';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Route } from '@angular/router';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { HomePageComponent } from './app/home/home-page/home-page.component';
import { LoginComponent } from './app/auth/login/login.component';
import { RegisterComponent } from './app/auth/register/register.component';
import { JoinFamilyComponent } from './app/family/join-family/join-family.component';
import { TaskListComponent } from './app/dashboard/task-list/task-list.component';
import { ShoppingListComponent } from './app/dashboard/shopping-list/shopping-list.component';
import { CalendarComponent } from './app/dashboard/calendar/calendar.component';
import { HttpClientModule } from '@angular/common/http';
import { appConfig } from './app/app.config';

const routes: Route[] = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'family/join', component: JoinFamilyComponent },

  {
    path: 'home',
    component: HomePageComponent,
    children: [
      { path: '', redirectTo: 'tasks', pathMatch: 'full' },  // за замовчуванням відкриває tasks
      { path: 'tasks', component: TaskListComponent },
      { path: 'shopping-list', component: ShoppingListComponent },
      { path: 'calendar', component: CalendarComponent }
    ]
  },
  {
    path: 'home/tasks/:id',
    loadComponent: () => import('./app/dashboard/task-list/task-list.component').then(m => m.TaskListComponent)
  },
  { path: '**', redirectTo: '/home' }
];


bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes), importProvidersFrom(HttpClientModule)],
}).catch((err) => console.error(err));

