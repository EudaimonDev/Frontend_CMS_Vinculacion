import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { PageHeaderComponent } from '../shared/components/page-header/page-header.component';
import { environment } from '../../../environments/environment';
import { forkJoin } from 'rxjs';

export interface StatCard {
  label: string;
  value: string;
  change: string;
  changeType: 'up' | 'down' | 'neutral';
  icon: string;
  color: string;
}

export interface RecentActivity {
  user: string;
  action: string;
  target: string;
  time: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, PageHeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  today = new Date();
  loading = signal(true);

  stats = signal<StatCard[]>([
    { label: 'Páginas publicadas',    value: '..', change: 'Cargando...', changeType: 'neutral', icon: 'publicadas', color: 'blue'   },
    { label: 'Catálogos activos',     value: '..', change: 'Cargando...', changeType: 'neutral', icon: 'catalogos',  color: 'teal'   },
    { label: 'Artículos en borrador', value: '..', change: 'Cargando...', changeType: 'neutral', icon: 'borrador',   color: 'purple' },
    { label: 'Total artículos',       value: '..', change: 'Cargando...', changeType: 'neutral', icon: 'total',      color: 'orange' },
  ]);

  recentActivity = signal<RecentActivity[]>([]);

  ngOnInit(): void {
    forkJoin({
      articles:  this.http.get<any>(`${this.api}/Articles/admin`, { params: { page: 1, pageSize: 100 } }),
      categories: this.http.get<any[]>(`${this.api}/Categories/admin`),
      auditLogs: this.http.get<any[]>(`${this.api}/AuditLog/recent`, { params: { count: 15 } })
    }).subscribe({
  next: ({ articles, categories, auditLogs }) => {
    const allArticles = Array.isArray(articles) ? articles : (articles.items ?? []);
    const published = allArticles.filter((a: any) => a.statusName === 'Published');
    const drafts = allArticles.filter((a: any) => a.statusName === 'Draft');
    const activeCategories = categories.filter(c => c.isPublicVisible);


        this.stats.set([
          {
            label: 'Páginas publicadas',
            value: published.length.toString(),
            change: `${allArticles.length} en total`,
            changeType: 'up',
            icon: 'publicadas',      // ← coincide con publicadas.png
            color: 'blue'
          },
          {
            label: 'Catálogos activos',
            value: activeCategories.length.toString(),
            change: `${categories.length} en total`,
            changeType: 'up',
            icon: 'catalogos',       // ← coincide con catalogos.png
            color: 'teal'
          },
          {
            label: 'Artículos en borrador',
            value: drafts.length.toString(),
            change: 'Pendientes de publicar',
            changeType: drafts.length > 0 ? 'neutral' : 'up',
            icon: 'borrador',        // ← coincide con borrador.png
            color: 'purple'
          },
          {
            label: 'Total artículos',
            value: allArticles.length.toString(),
            change: `${published.length} publicados`,
            changeType: 'up',
            icon: 'total',           // ← coincide con total.png
            color: 'orange'
          },
        ]);

        // Actividad reciente basada en artículos
        this.recentActivity.set(
          auditLogs
            .filter((log: any) => !log.entity?.toLowerCase().includes('auth'))  // ← quita logins
            .map((log: any) => ({
              user:   log.user ?? 'Sistema',
              action: this.actionLabel(log.action, log.entity),
              target: log.detail?.startsWith('StatusCode') ? '' : (log.detail ?? ''),
              time:   this.timeAgo(log.createdAt)
            }))
        );

        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  private actionLabel(method: string, entity: string): string {
  const path = entity?.toLowerCase() ?? '';

  const isCategory = path.includes('categor') || path.includes('catalog');
  const isMedia    = path.includes('media');
  const isArticle  = path.includes('article');
  const isAuth     = path.includes('auth');
  const isStatus   = path.includes('status');

  if (isAuth) return 'inició sesión';

  switch (method?.toUpperCase()) {
    case 'POST':
      if (isCategory) return 'creó el catálogo';
      if (isMedia)    return 'subió una imagen';
      if (isArticle)  return 'creó la página';
      return 'creó un elemento';
    case 'PUT':
      if (isCategory) return 'editó el catálogo';
      if (isMedia)    return 'editó una imagen';
      if (isArticle)  return 'editó la página';
      return 'editó un elemento';
    case 'PATCH':
      if (isStatus)   return 'cambió el estado de la página';
      if (isArticle)  return 'actualizó la página';
      return 'actualizó un elemento';
    case 'DELETE':
      if (isCategory) return 'eliminó el catálogo';
      if (isMedia)    return 'eliminó una imagen';
      if (isArticle)  return 'eliminó la página';
      return 'eliminó un elemento';
    default:
      return 'realizó una acción';
  }
}

  private timeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);

    if (diff < 60) return 'Hace un momento';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} horas`;
    return `Hace ${Math.floor(diff / 86400)} días`;
  }
}
