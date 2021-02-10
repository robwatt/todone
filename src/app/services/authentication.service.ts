import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { from, Observable, ReplaySubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import firebase from 'firebase/app';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private user!: firebase.auth.UserCredential;
  
  loggedIn: ReplaySubject<boolean> = new ReplaySubject();

  constructor(private auth: AngularFireAuth) {}

  login(email: string, password: string): Observable<any> {
    return from(this.auth.signInWithEmailAndPassword(email, password)).pipe(
      tap((user: firebase.auth.UserCredential) => {
        this.user = user;
        this.loggedIn.next(true);
      })
    );
  }

  logout(): Promise<any> {
    this.loggedIn.next(false);
    return this.auth.signOut();
  }

  /**
   * Gets the UID of the logged in user
   * @returns return the UID of the logged in user, or undefined if the user does not exist.
   */
  getUID(): string | undefined {
    if (this.user) {
      return this.user.user?.uid;
    }
    // maybe throw an exception since the user is clearly logged out
    return undefined;
  }
}
