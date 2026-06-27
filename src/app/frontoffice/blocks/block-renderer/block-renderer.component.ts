import { Component, Input, OnChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Block, HeroBlockData, CardsGridBlockData, GalleryBlockData, VideoBlockData } from '../../core/models/block.model';
import { HeroBlockComponent } from '../hero-block/hero-block.component';
import { CardsGridComponent } from '../cards-grid/cards-grid.component';
import { GalleryGridComponent } from '../gallery-grid/gallery-grid.component';

@Component({
  selector: 'app-block-renderer',
  standalone: true,
  imports: [
    CommonModule,
    HeroBlockComponent,
    CardsGridComponent,
    GalleryGridComponent,
  ],
  templateUrl: './block-renderer.component.html',
  styles: [
    `
      .video-block {
        width: 70%;
        max-width: 70%;
        margin: 0.5rem auto;
        padding: 0 1rem;
        box-sizing: border-box;
      }

      .video-block__wrapper {
        position: relative;
        width: 100%;
        padding-bottom: 56.25%;
        height: 0;
        overflow: hidden;
        border-radius: 8px;
        background: #000;
      }

      .video-block__wrapper iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: 0;
      }

      .video-block__title {
        margin: 0.5rem 0 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: #1e293b;
        text-align: center;
        line-height: 1.4;
      }

      @media (max-width: 768px) {
        .video-block {
          width: 100%;
          max-width: 100%;
        }
      }
    `,
  ],
})
export class BlockRendererComponent implements OnChanges {
  @Input() block!: Block;

  private sanitizer = inject(DomSanitizer);

  heroData!: HeroBlockData;
  cardsData!: CardsGridBlockData;
  galleryData!: GalleryBlockData;
  videoUrl: SafeResourceUrl | null = null;
  videoTitle = '';

  ngOnChanges(): void {
    if (this.block.type === 'hero')         this.heroData    = this.block.data as HeroBlockData;
    if (this.block.type === 'cards-grid')   this.cardsData   = this.block.data as CardsGridBlockData;
    if (this.block.type === 'gallery-grid') this.galleryData = this.block.data as GalleryBlockData;
    if (this.block.type === 'video') {
      const data = this.block.data as VideoBlockData;
      this.videoUrl   = this.sanitizer.bypassSecurityTrustResourceUrl(
        this.toEmbedUrl(data.url ?? '')
      );
      this.videoTitle = data.title ?? '';
    }
  }

  private toEmbedUrl(url: string): string {
    if (!url) return '';
    const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
    return url;
  }
}
