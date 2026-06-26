import { Component, inject } from '@angular/core';
import { MediaService } from './services/media.service';
import { MediaFiltersComponent } from './components/media-filters/media-filters.component';
import { MediaUploadComponent } from './components/media-upload/media-upload.component';
import { MediaGridComponent } from './components/media-grid/media-grid.component';
import { MediaListComponent } from './components/media-list/media-list.component';
import { MediaDetailComponent } from './components/media-detail/media-detail.component';

@Component({
  selector: 'app-multimedia',
  imports: [MediaFiltersComponent,MediaUploadComponent,MediaGridComponent, MediaDetailComponent, MediaListComponent],
  templateUrl: './multimedia.component.html',
  styleUrl: './multimedia.component.scss',
})
export class Multimedia {
  protected readonly media = inject(MediaService);
 
  /** Alterna el panel lateral de subida */
  protected showUpload = false;
 
  openUpload():  void { this.showUpload = true;  }
  closeUpload(): void { this.showUpload = false; }
}
