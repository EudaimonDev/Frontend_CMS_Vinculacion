import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeStatus = 'published' | 'draft' | 'archived' | 'active' | 'inactive';

const STATUS_LABELS: Record<BadgeStatus, string> = {
  published: 'Publicado',
  draft:     'Borrador',
  archived:  'Archivado',
  active:    'Activo',
  inactive:  'Inactivo'
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.html',
  styleUrls: ['./status-badge.scss']
})
export class StatusBadgeComponent {
  // Input obligatorio (Signal)
  status = input.required<BadgeStatus>();
  
  // Etiqueta que cambia sola (Computed Signal)
  label = computed(() => STATUS_LABELS[this.status()] ?? this.status());
}