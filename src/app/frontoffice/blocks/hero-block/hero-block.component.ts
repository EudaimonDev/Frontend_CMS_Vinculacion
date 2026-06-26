import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeroBlockData } from '../../core/models/block.model';

@Component({
  selector: 'app-hero-block',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hero-block.component.html',
  styleUrls: ['./hero-block.component.scss'],
})
export class HeroBlockComponent {
  @Input() data!: HeroBlockData;
}
