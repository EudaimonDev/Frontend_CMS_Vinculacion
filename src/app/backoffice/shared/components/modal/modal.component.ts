import { Component, input, output } from '@angular/core';

export type ModalVariant = 'default' | 'danger';

@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss'
})
export class ModalComponent {
  title         = input.required<string>();
  description   = input<string>();
  confirmLabel  = input('Confirmar');
  cancelLabel   = input('Cancelar');
  variant       = input<ModalVariant>('default');
  loading       = input(false);

  confirmed = output<void>();
  cancelled = output<void>();
}
