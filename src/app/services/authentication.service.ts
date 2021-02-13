import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';
import { from, Observable, ReplaySubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private user: any;

  loggedIn: ReplaySubject<boolean> = new ReplaySubject();

  constructor(private auth: AngularFireAuth) {
    this.auth.authState.subscribe((user) => {
      if (user) {
        this.user = user;
        localStorage.setItem('user', JSON.stringify(this.user));
        this.loggedIn.next(true);
      } else {
        localStorage.removeItem('user');
        this.loggedIn.next(false);
      }
    });
  }

  /**
   * Logs the user into the system, if they exist in the db.
   * @param email Email of the user
   * @param password Password for the account
   */
  login(email: string, password: string): Observable<any> {
    return from(this.auth.signInWithEmailAndPassword(email, password)).pipe(
      tap((user: firebase.auth.UserCredential) => {
        this.user = user;
        this.loggedIn.next(true);
      })
    );
  }

  /**
   * Logs the user out of the system
   */
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
      return this.user.uid;
    }
    // maybe throw an exception since the user is clearly logged out
    return undefined;
  }
}
