import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { GatekeeperForm, GatekeeperResponse } from '../models/gatekeeper.model';
import { environment } from '../../../../environments/environment';

const TOKEN_KEY    = 'ug_wiki_token';
const VISITOR_KEY  = 'ug_wiki_visitor';
const TOKEN_EXPIRY = 'ug_wiki_token_expiry';

@Injectable({ providedIn: 'root' })
export class GatekeeperService {
  private http = inject(HttpClient);

  hasValidToken(): boolean {
    const token  = localStorage.getItem(TOKEN_KEY);
    const expiry = localStorage.getItem(TOKEN_EXPIRY);
    if (!token || !expiry) return false;
    return Date.now() < Number(expiry);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getVisitor(): GatekeeperResponse['visitor'] | null {
    const raw = localStorage.getItem(VISITOR_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  register(form: GatekeeperForm): Observable<GatekeeperResponse> {
    return this.http
      .post<GatekeeperResponse>(`${environment.apiUrl}/Gatekeeper/register`, form)
      .pipe(tap(res => this.saveToken(res)));
  }

  validate(token: string): Observable<GatekeeperResponse> {
    return this.http
      .get<GatekeeperResponse>(`${environment.apiUrl}/Gatekeeper/validate`, {
        params: { token }
      });
  }

  private saveToken(res: GatekeeperResponse): void {
    const expiry = Date.now() + res.expiresIn * 1000;
    localStorage.setItem(TOKEN_KEY,    res.token);
    localStorage.setItem(TOKEN_EXPIRY, String(expiry));
    localStorage.setItem(VISITOR_KEY,  JSON.stringify(res.visitor));
  }

  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY);
    localStorage.removeItem(VISITOR_KEY);
  }
}
