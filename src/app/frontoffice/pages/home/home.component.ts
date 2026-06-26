import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CmsService } from '../../core/services/cms.service';
import { BlockRendererComponent } from '../../blocks/block-renderer/block-renderer.component';
import { Block } from '../../core/models/block.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, BlockRendererComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  private cms = inject(CmsService);

  blocks = signal<Block[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.cms.getHomePage().subscribe((page) => {
      this.blocks.set(page.blocks as Block[]);
      this.loading.set(false);
    });
  }
}
