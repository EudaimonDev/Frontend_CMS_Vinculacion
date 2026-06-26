import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  collapsed   = input(false);
  closeMobile = output<void>();

  navItems: NavItem[] = [
    { label: 'Dashboard',     icon: 'dashboard', route: '/admin/dashboard' },
    { label: 'Páginas',       icon: 'pages',     route: '/admin/pages'     },
    { label: 'Catálogos',     icon: 'catalogs',  route: '/admin/catalogs'  },
    { label: 'Multimedia',    icon: 'media',     route: '/admin/media'     },
    //{ label: 'Usuarios',      icon: 'users',     route: '/admin/users'     },
    //{ label: 'Configuración', icon: 'settings',  route: '/admin/settings'  },
  ];
}
