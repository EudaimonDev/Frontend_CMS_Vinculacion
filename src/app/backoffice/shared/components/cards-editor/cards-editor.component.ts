import { Component, input, output, signal } from '@angular/core';
import { CardItem } from '../../../../frontoffice/core/models/block.model';

@Component({
  selector: 'app-cards-editor',
  standalone: true,
  template: `
    <div class="cards-editor">
      <div class="cards-editor__header">
        <p class="cards-editor__heading">Tarjetas</p>
        <button type="button" class="cards-editor__add" (click)="addCard()" title="Agregar tarjeta">
          +
        </button>
      </div>

      <div class="cards-editor__list">
        @for (card of cards(); track $index; let i = $index) {
          <div class="cards-editor__item" [class.cards-editor__item--open]="expandedIndex() === i">
            <button type="button" class="cards-editor__item-head" (click)="toggleExpanded(i)">
              <span class="cards-editor__item-label">
                {{ card.title.trim() || ('Tarjeta ' + (i + 1)) }}
              </span>
              <span class="cards-editor__item-order">#{{ i + 1 }}</span>
              <svg
                class="cards-editor__chevron"
                [class.cards-editor__chevron--open]="expandedIndex() === i"
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            @if (expandedIndex() === i) {
              <div class="cards-editor__item-body">
                <label class="cards-editor__field-label">Título</label>
                <input
                  type="text"
                  class="cards-editor__input"
                  [value]="card.title"
                  (input)="updateCard(i, { title: inputVal($event) })"
                />

                <label class="cards-editor__field-label">Contenido</label>
                <textarea
                  class="cards-editor__textarea"
                  rows="3"
                  [value]="card.description"
                  (input)="updateCard(i, { description: inputVal($event) })"
                ></textarea>

                <div class="cards-editor__order-row">
                  <span class="cards-editor__field-label">Orden</span>
                  <div class="cards-editor__order-actions">
                    <button
                      type="button"
                      class="cards-editor__order-btn"
                      [disabled]="i === 0"
                      (click)="moveCard(i, -1)"
                      title="Subir"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      class="cards-editor__order-btn"
                      [disabled]="i === cards().length - 1"
                      (click)="moveCard(i, 1)"
                      title="Bajar"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      class="cards-editor__remove"
                      [disabled]="cards().length <= 1"
                      (click)="removeCard(i)"
                      title="Eliminar tarjeta"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .cards-editor {
        margin-top: 0.25rem;
        padding-top: 0.75rem;
        border-top: 1px dashed #e2e8f0;
      }

      .cards-editor__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.75rem;
      }

      .cards-editor__heading {
        font-size: 0.6875rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #64748b;
        margin: 0;
      }

      .cards-editor__add {
        width: 1.75rem;
        height: 1.75rem;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        background: #fff;
        color: #1e5fa8;
        font-size: 1.125rem;
        line-height: 1;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s, border-color 0.2s;

        &:hover {
          background: #eef4fb;
          border-color: #1e5fa8;
        }
      }

      .cards-editor__list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .cards-editor__item {
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        background: #f8fafc;
        overflow: hidden;
      }

      .cards-editor__item--open {
        border-color: #93c5fd;
        background: #fff;
      }

      .cards-editor__item-head {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.625rem 0.75rem;
        border: none;
        background: transparent;
        cursor: pointer;
        text-align: left;
      }

      .cards-editor__item-label {
        flex: 1;
        min-width: 0;
        font-size: 0.8125rem;
        font-weight: 600;
        color: #0f172a;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .cards-editor__item-order {
        font-size: 0.6875rem;
        font-weight: 700;
        color: #94a3b8;
      }

      .cards-editor__chevron {
        flex-shrink: 0;
        color: #64748b;
        transition: transform 0.2s;
      }

      .cards-editor__chevron--open {
        transform: rotate(180deg);
      }

      .cards-editor__item-body {
        padding: 0 0.75rem 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }

      .cards-editor__field-label {
        font-size: 0.6875rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: #64748b;
      }

      .cards-editor__input,
      .cards-editor__textarea {
        width: 100%;
        padding: 0.5rem 0.625rem;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        font-size: 0.8125rem;
        color: #0f172a;
        background: #fff;
        box-sizing: border-box;
      }

      .cards-editor__textarea {
        resize: vertical;
        min-height: 4.5rem;
        font-family: inherit;
      }

      .cards-editor__order-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        margin-top: 0.25rem;
      }

      .cards-editor__order-actions {
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .cards-editor__order-btn {
        width: 1.75rem;
        height: 1.75rem;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        background: #fff;
        color: #475569;
        cursor: pointer;
        font-size: 0.875rem;

        &:hover:not(:disabled) {
          background: #f1f5f9;
          border-color: #94a3b8;
        }

        &:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      }

      .cards-editor__remove {
        border: none;
        background: transparent;
        color: #dc2626;
        font-size: 0.75rem;
        font-weight: 600;
        cursor: pointer;
        padding: 0.25rem 0.375rem;

        &:hover:not(:disabled) {
          text-decoration: underline;
        }

        &:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      }
    `,
  ],
})
export class CardsEditorComponent {
  cards = input.required<CardItem[]>();
  cardsChange = output<CardItem[]>();

  expandedIndex = signal<number | null>(0);

  inputVal(event: Event): string {
    return (event.target as HTMLInputElement | HTMLTextAreaElement).value;
  }

  toggleExpanded(index: number): void {
    this.expandedIndex.update((current) => (current === index ? null : index));
  }

  addCard(): void {
    const next = [
      ...this.cards(),
      {
        title: `Tarjeta ${this.cards().length + 1}`,
        description: '',
      },
    ];
    this.cardsChange.emit(next);
    this.expandedIndex.set(next.length - 1);
  }

  updateCard(index: number, patch: Partial<CardItem>): void {
    const next = this.cards().map((card, i) => (i === index ? { ...card, ...patch } : card));
    this.cardsChange.emit(next);
  }

  moveCard(index: number, direction: -1 | 1): void {
    const target = index + direction;
    if (target < 0 || target >= this.cards().length) return;

    const next = [...this.cards()];
    [next[index], next[target]] = [next[target], next[index]];
    this.cardsChange.emit(next);
    this.expandedIndex.set(target);
  }

  removeCard(index: number): void {
    if (this.cards().length <= 1) return;

    const next = this.cards().filter((_, i) => i !== index);
    this.cardsChange.emit(next);

    const expanded = this.expandedIndex();
    if (expanded === index) {
      this.expandedIndex.set(Math.min(index, next.length - 1));
    } else if (expanded !== null && expanded > index) {
      this.expandedIndex.set(expanded - 1);
    }
  }
}
