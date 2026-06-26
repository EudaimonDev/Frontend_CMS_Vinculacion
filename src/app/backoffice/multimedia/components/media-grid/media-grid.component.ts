import { Component, inject } from '@angular/core';
import { MediaService } from '../../services/media.service';
import { MediaCardComponent } from '../media-card/media-card.component';
@Component({
  selector: 'app-media-grid',
  standalone: true,
  imports: [MediaCardComponent],
  templateUrl: './media-grid.component.html',
  styleUrl: './media-grid.component.scss',
})
export class MediaGridComponent {
  protected readonly media = inject(MediaService);

}
