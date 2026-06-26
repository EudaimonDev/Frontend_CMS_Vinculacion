import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CtaBlock } from '../../core/models/block.model';

@Component({
  selector: 'app-cta-block',
  imports: [RouterLink],
  template: `
    <section class="cta-block cta-block--{{ block().data.variant ?? 'primary' }}">
      <div class="cta-block__content">
        <h2 class="cta-block__title">{{ block().data.title }}</h2>
        @if (block().data.description) {
          <p class="cta-block__description">{{ block().data.description }}</p>
        }
        <div class="cta-block__actions">
          <a
            class="cta-block__btn cta-block__btn--primary"
            [routerLink]="block().data.primaryRoute"
          >
            {{ block().data.primaryLabel }}
          </a>
          @if (block().data.secondaryLabel && block().data.secondaryRoute) {
            <a
              class="cta-block__btn cta-block__btn--secondary"
              [routerLink]="block().data.secondaryRoute"
            >
              {{ block().data.secondaryLabel }}
            </a>
          }
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .cta-block {
        padding: 4rem 2rem;
        text-align: center;

        &--primary {
          background: #1e5fa8;
          color: #fff;
        }
        &--accent {
          background: #0d9488;
          color: #fff;
        }

        &__content {
          max-width: 640px;
          width: 100%;
          margin: 0 auto;
          min-width: 0;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        &__title {
          font-size: clamp(1.5rem, 3vw, 2.25rem);
          font-weight: 700;
          margin-bottom: 0.75rem;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        &__description {
          font-size: 1.0625rem;
          opacity: 0.9;
          margin-bottom: 2rem;
          line-height: 1.6;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        &__actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        &__btn {
          padding: 0.875rem 2rem;
          border-radius: 999px;
          font-weight: 700;
          font-size: 0.9375rem;
          transition:
            transform 0.2s ease,
            opacity 0.2s ease;

          &:hover {
            transform: translateY(-2px);
            opacity: 0.9;
          }

          &--primary {
            background: #fff;
            color: #1e5fa8;
          }
          &--secondary {
            background: transparent;
            color: #fff;
            border: 2px solid rgba(255, 255, 255, 0.6);

            &:hover {
              border-color: #fff;
            }
          }
        }
      }
    `,
  ],
})
export class CtaBlockComponent {
  block = input.required<CtaBlock>();
}
