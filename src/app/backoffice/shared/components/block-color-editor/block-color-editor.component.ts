import { Component, input, output } from '@angular/core';
import { ColorFieldDef } from '../../utils/block-color.util';

@Component({
  selector: 'app-block-color-editor',
  standalone: true,
  template: `
    <div class="color-fields">
      <p class="color-fields__heading">Colores</p>
      @for (field of fields(); track field.key) {
        <div class="color-field">
          <span class="color-field__label">{{ field.label }}</span>
          <div class="color-field__actions">
            <button
              type="button"
              class="color-field__edit"
              (click)="openPicker(picker)"
              [attr.aria-label]="'Editar ' + field.label"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            </button>
            <button
              type="button"
              class="color-field__swatch"
              [class.color-field__swatch--empty]="!hasColor(field.key)"
              [style.backgroundColor]="swatchColor(field)"
              (click)="openPicker(picker)"
              [attr.aria-label]="'Seleccionar ' + field.label"
            ></button>
            <input
              #picker
              type="color"
              class="color-field__picker-hidden"
              [value]="pickerValue(field)"
              (input)="onChange(field.key, $event)"
            />
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .color-fields {
        margin-top: 0.5rem;
        padding-top: 0.75rem;
        border-top: 1px dashed #e2e8f0;
      }

      .color-fields__heading {
        font-size: 0.6875rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #64748b;
        margin: 0 0 0.75rem;
      }

      .color-field {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        margin-bottom: 0.625rem;
      }

      .color-field__label {
        font-size: 0.75rem;
        font-weight: 600;
        color: #475569;
        flex: 1;
        min-width: 0;
      }

      .color-field__actions {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        flex-shrink: 0;
      }

      .color-field__edit {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 1.75rem;
        height: 1.75rem;
        padding: 0;
        border: none;
        border-radius: 6px;
        background: transparent;
        color: #64748b;
        cursor: pointer;
        transition: color 0.2s, background 0.2s;

        &:hover {
          color: #1e5fa8;
          background: #eef4fb;
        }
      }

      .color-field__swatch {
        width: 1.75rem;
        height: 1.75rem;
        padding: 0;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        cursor: pointer;
        transition: transform 0.15s, box-shadow 0.15s;

        &:hover {
          transform: scale(1.05);
          box-shadow: 0 0 0 2px rgba(30, 95, 168, 0.2);
        }

        &--empty {
          background:
            linear-gradient(45deg, #e2e8f0 25%, transparent 25%),
            linear-gradient(-45deg, #e2e8f0 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #e2e8f0 75%),
            linear-gradient(-45deg, transparent 75%, #e2e8f0 75%) !important;
          background-size: 8px 8px !important;
          background-position: 0 0, 0 4px, 4px -4px, -4px 0 !important;
          background-color: #f8fafc !important;
        }
      }

      .color-field__picker-hidden {
        position: absolute;
        width: 0;
        height: 0;
        opacity: 0;
        pointer-events: none;
      }
    `,
  ],
})
export class BlockColorEditorComponent {
  fields = input.required<ColorFieldDef[]>();
  data = input.required<Record<string, unknown>>();
  colorChange = output<{ key: string; value: string }>();

  hasColor(key: string): boolean {
    const raw = this.data()[key];
    return typeof raw === 'string' && raw.trim().length > 0;
  }

  pickerValue(field: ColorFieldDef): string {
    const raw = this.data()[field.key];
    return typeof raw === 'string' && raw.trim() ? raw : (field.default ?? '#000000');
  }

  swatchColor(field: ColorFieldDef): string | null {
    return this.hasColor(field.key) ? this.pickerValue(field) : null;
  }

  openPicker(input: HTMLInputElement): void {
    input.click();
  }

  onChange(key: string, event: Event): void {
    this.colorChange.emit({ key, value: (event.target as HTMLInputElement).value });
  }
}
