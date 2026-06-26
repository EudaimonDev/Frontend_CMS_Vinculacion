import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginCredentials, User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  private http = inject(HttpClient);

  private _token       = signal<string | null>(localStorage.getItem('cms_token'));
  private _currentUser = signal<User | null>(this._loadUserFromStorage());

  readonly isAuthenticated = computed(() => this._token() !== null);
  readonly currentUser     = this._currentUser.asReadonly();

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/Auth/login`, credentials)
      .pipe(
        tap(({ token, user }) => {
          this._token.set(token);
          this._currentUser.set(user);
          localStorage.setItem('cms_token', token);
          localStorage.setItem('cms_user', JSON.stringify(user));
        })
      );
  }

  logout(): void {
    this._token.set(null);
    this._currentUser.set(null);
    localStorage.removeItem('cms_token');
    localStorage.removeItem('cms_user');
    this.router.navigate(['/admin/login']);
  }

  getToken(): string | null {
    return this._token();
  }

  private _loadUserFromStorage(): User | null {
    try {
      const raw = localStorage.getItem('cms_user');
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }
}
