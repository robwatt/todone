import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoggedInGuard } from 'ngx-auth-firebaseui';
import { LoginComponent } from './login/login.component';
import { NavigationComponent } from './navigation/navigation.component';
import { RegisterComponent } from './register/register.component';
import { TodoComponent } from './todo/todo.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'dashboard',
    component: NavigationComponent,
    canActivate: [LoggedInGuard],
    children: [
      { path: '', redirectTo: 'todo', pathMatch: 'full' },
      { path: 'todo', component: TodoComponent, data: {todoType: 'work'} },
      { path: 'todo-personal', component: TodoComponent, data: {todoType: 'personal'} }
    ]
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
