import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-accesibilidad-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accesibilidad-modal.component.html',
  styleUrls: ['./accesibilidad-modal.component.scss'],
})
export class AccesibilidadModalComponent {
  @Input() isVisible: boolean = false;
  @Output() onClose = new EventEmitter<void>();

  // Definimos los pilares de accesibilidad del CMS
  caracteristicas = [
    {
      titulo: 'Facilidad de Lectura',
      desc: 'Diseño con fuentes claras y contrastes adecuados para una lectura cómoda.',
      icon: 'bi-eye-fill',
    },
    {
      titulo: 'Navegación Simple',
      desc: 'Estructura organizada para encontrar la información rápidamente.',
      icon: 'bi-compass-fill',
    },
    {
      titulo: 'Contraste Elevado',
      desc: 'Paleta de colores diseñada para cumplir con los estándares de legibilidad.',
      icon: 'bi-circle-half',
    },
  ];

  close() {
    this.onClose.emit();
  }
}
