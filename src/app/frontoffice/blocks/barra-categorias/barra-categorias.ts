import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { filter } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

interface Categoria {
  categoryId: number;
  slug: string;
  name: string;
}

@Component({
  selector: 'app-barra-categorias',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './barra-categorias.html',
  styleUrls: ['./barra-categorias.scss']
})
export class BarraCategoriasComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  categorias: Categoria[] = [];
  categoriaActiva: string | null = null;

  ngOnInit(): void {
    this.http
      .get<Categoria[]>(`${environment.apiUrl}/Categories`)
      .subscribe(cats => this.categorias = cats);

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.actualizarCategoriaActiva());

    this.actualizarCategoriaActiva();
  }

  private actualizarCategoriaActiva(): void {
    const slug = this.route.snapshot.firstChild?.params['slug'];
    this.categoriaActiva = slug || null;
  }

  navegarACategoria(slug: string): void {
    this.router.navigate(['/categoria', slug]);
  }

  navegarATodos(): void {
    this.router.navigate(['/']);
  }
}
