import { Component, input } from '@angular/core';
import { TextBlock } from '../../core/models/block.model';

@Component({
  selector: 'app-text-block',
  imports: [],
  template: `
    <section
      class="text-block text-block--{{ block().data.align ?? 'left' }}"
      [style.backgroundColor]="block().data.backgroundColor || null"
      [style.color]="block().data.textColor || null"
    >
      @if (block().data.title) {
        <h2 class="text-block__title" [style.color]="block().data.titleColor || null">
          {{ block().data.title }}
        </h2>
      }
      <div class="text-block__body" [innerHTML]="block().data.html"></div>
    </section>
  `,
  styles: [
    `
      .text-block {
        width: 100%;
        max-width: 860px;
        margin: 0 auto;
        padding: 1rem 2rem;
        box-sizing: border-box;
        overflow-wrap: anywhere;
        word-break: break-word;

        &--center {
          text-align: center;
        }
        &--right {
          text-align: right;
        }

        &__title {
          font-size: 1.875rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.75rem;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        &__body {
          font-size: 1rem;
          line-height: 1.7;
          color: #334155;
          max-width: 100%;
          overflow-wrap: anywhere;
          word-break: break-word;

          :is(p) {
            margin: 0 0 0.75rem;

            &:last-child {
              margin-bottom: 0;
            }
          }

          :is(p, span, div, li, td, th, h1, h2, h3, h4, h5, h6, a, strong, em, blockquote, pre) {
            max-width: 100%;
            overflow-wrap: anywhere;
            word-break: break-word;
          }

          pre, code {
            white-space: pre-wrap;
          }

          img, iframe, video {
            max-width: 100%;
            height: auto;
          }
        }
      }
    `,
  ],
})
export class TextBlockComponent {
  block = input.required<TextBlock>();
}
