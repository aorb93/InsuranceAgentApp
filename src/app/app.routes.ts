import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DefaultLayoutComponent } from './layout/default-layout/default-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';
import { ClientsComponent } from './components/clients/clients.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: DefaultLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'clients', component: ClientsComponent }
    ]
  },
  { path: '**', redirectTo: 'login' }
];