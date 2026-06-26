import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GatekeeperService } from '../../../core/services/gatekeeper.service';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.scss'],
})
export class RegisterFormComponent {
  showModalPrivacidad = false;

  @Output() registered = new EventEmitter<void>();

  loading = signal(false);
  error = signal<string | null>(null);
  form!: ReturnType<FormBuilder['group']>;

  constructor(
    private fb: FormBuilder,
    private gatekeeper: GatekeeperService,
  ) {
    this.form = this.fb.group({
      nombres: [''], // opcional
      edad: ['', [Validators.required, Validators.min(1)]],
      sexo: ['', Validators.required],
    });
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.gatekeeper.register(this.form.value).subscribe({
      next: () => {
        this.loading.set(false);
        this.registered.emit();
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Ocurrió un error. Intenta nuevamente.');
      },
    });
  }

  toggleModal(estado: boolean) {
    this.showModalPrivacidad = estado;
  }

  soloNumeros(event: KeyboardEvent): boolean {
  return /[0-9]/.test(event.key);
}
}
