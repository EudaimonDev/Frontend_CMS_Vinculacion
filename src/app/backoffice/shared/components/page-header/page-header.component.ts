import { Component, input } from '@angular/core';

export interface Breadcrumb {
  label: string;
  route?: string;
}

@Component({
  selector: 'app-page-header',
  imports: [],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss'
})
export class PageHeaderComponent {
  title       = input.required<string>();
  description = input<string>();
  breadcrumbs = input<Breadcrumb[]>([]);
}
