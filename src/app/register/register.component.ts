import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  created(event: any): void {
    this.router.navigate(['dashboard']);
  }

  loginRequested(): void {
    this.router.navigate(['login']);
  }
}
