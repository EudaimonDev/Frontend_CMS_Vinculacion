import { Component, signal, inject, OnInit, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { GatekeeperService } from '../../../core/services/gatekeeper.service';

interface NavCategory {
  categoryId: number;
  name: string;
  slug: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);
  private elementRef = inject(ElementRef);
  private gatekeeper = inject(GatekeeperService);

  activeCategory = signal<string>('todos');
  searchQuery = '';
  menuOpen = false;
  navLinks = signal<{ label: string; slug: string; route: string }[]>([]);

  ngOnInit(): void {
    this.http
      .get<NavCategory[]>(`${environment.apiUrl}/Categories`)
      .subscribe(categories => {
        this.navLinks.set(
          categories.map(c => ({
            label: c.name,
            slug: c.slug,
            route: `/categoria/${c.slug}`,
          }))
        );
      });
  }

  setActive(category: string): void {
    this.activeCategory.set(category);
    this.menuOpen = false;
    if (category === 'todos') {
      this.router.navigate(['/']);
    }
  }

  perfomSearch(): void {
    const query = this.searchQuery.trim();
    if (!query) return;
    this.router.navigate(['/explorar'], { queryParams: { q: query } });
    this.menuOpen = false;
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  cerrarSesion(): void {
    this.gatekeeper.clearToken();
    this.menuOpen = false;
    this.router.navigate(['/acceso']);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.menuOpen = false;
    }
  }
}
