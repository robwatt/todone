import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  email!: string;
  password!: string;

  constructor(private router: Router, private auth: AuthenticationService) {}

  ngOnInit(): void {}

  login(loginForm: NgForm): void {
    console.log('login form', loginForm.value);
    this.auth.login(loginForm.value.email, loginForm.value.password);
    this.router.navigate(['dashboard']);
  }
}
