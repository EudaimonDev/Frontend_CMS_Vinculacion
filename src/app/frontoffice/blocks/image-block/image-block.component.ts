import { Component, input } from '@angular/core';
import { ImageBlock } from '../../core/models/block.model';

@Component({
  selector: 'app-image-block',
  imports: [],
  template: `
    <figure class="image-block" [class.image-block--full]="block().data.fullWidth">
      <img
        class="image-block__img"
        [src]="block().data.src"
        [alt]="block().data.alt"
        loading="lazy"
      />
      @if (block().data.caption) {
        <figcaption class="image-block__caption">{{ block().data.caption }}</figcaption>
      }
    </figure>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        min-width: 0;
      }

      .image-block {
        margin: 2rem auto;
        max-width: 860px;
        padding: 0 2rem;
        box-sizing: border-box;

        &--full {
          max-width: 100%;
          padding: 0;
        }

        &__img {
          width: 100%;
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          display: block;
          object-fit: contain;
        }

        &__caption {
          margin-top: 0.5rem;
          text-align: center;
          font-size: 0.875rem;
          color: #64748b;
        }
      }
    `,
  ],
})
export class ImageBlockComponent {
  block = input.required<ImageBlock>();
}
