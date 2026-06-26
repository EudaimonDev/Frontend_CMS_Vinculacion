import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacidad-layout-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './privacidad-layout-modal.component.html',
  styleUrls: ['./privacidad-layout-modal.component.scss'],
})
export class PrivacidadLayoutModalComponent {
  @Input() isVisible: boolean = false;
  @Output() onClose = new EventEmitter<void>();

  close() {
    this.onClose.emit();
  }
}
