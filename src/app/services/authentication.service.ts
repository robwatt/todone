import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private auth: AngularFireAuth, private router: Router) { }

  login(email: string, password: string): void {
    this.auth.signInWithEmailAndPassword(email, password)
    .then((user: any) => {
      console.log('user logged in', user);
      this.router.navigate(['dashboard']);
    });
  }

  logout(): void {
    this.auth.signOut().then(() => {
      console.log('user logged out');
      this.router.navigate(['']);
    });
  }
}
