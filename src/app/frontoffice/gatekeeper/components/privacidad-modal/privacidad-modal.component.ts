import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacidad-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './privacidad-modal.component.html',
  styleUrls: ['./privacidad-modal.component.scss'],
})
export class PrivacidadModalComponent {
  @Input() isVisible: boolean = false;
  @Output() onClose = new EventEmitter<void>();

  close() {
    console.log('El modal está intentando cerrar...');
    this.onClose.emit();
  }
}
