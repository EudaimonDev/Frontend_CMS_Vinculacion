import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contacto-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contacto-modal.component.html',
  styleUrls: ['./contacto-modal.component.scss'],
})
export class ContactoModalComponent {
  @Input() isVisible: boolean = false;
  @Output() onClose = new EventEmitter<void>();

  facultad = 'Ciencias Médicas';
  carrera = 'Obstetricia';

  close() {
    this.onClose.emit();
  }
}
