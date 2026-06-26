import { Component, inject, input, output, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private authService = inject(AuthService);

  pageTitle       = input('Dashboard');
  toggleSidebar   = output<void>();

  currentUser  = this.authService.currentUser;
  userMenuOpen = signal(false);

  toggleUserMenu(): void {
    this.userMenuOpen.update(v => !v);
  }

  logout(): void {
    this.userMenuOpen.set(false);
    this.authService.logout();
  }

  getUserInitials(): string {
    const name = this.currentUser()?.name ?? 'Admin';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }
}
