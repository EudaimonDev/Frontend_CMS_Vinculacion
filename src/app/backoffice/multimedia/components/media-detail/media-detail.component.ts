import { Component, computed, inject, signal } from '@angular/core';
import { MediaService } from '../../services/media.service';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-media-detail',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './media-detail.component.html',
  styleUrl: './media-detail.component.scss',
})
export class MediaDetailComponent{
  protected readonly media = inject(MediaService);
 
  //Estado de edición
  protected editName   = signal('');
  protected editTags   = signal('');   // string CSV
  protected isEditing  = signal(false);
 
  //Ítems convertidos de signal a computed para template
  protected readonly item = computed(() => this.media.selectedItem());
 
  //Acciones
  startEdit(): void {
    const it = this.item();
    if (!it) return;
    this.editName.set(it.name);
    this.editTags.set(it.tags.join(', '));
    this.isEditing.set(true);
  }
 
  saveEdit(): void {
    const it = this.item();
    if (!it) return;
 
    const name = this.editName().trim();
    const tags  = this.editTags()
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
 
    if (name) this.media.update(it.id, { name, tags });
    this.isEditing.set(false);
  }
 
  cancelEdit(): void {
    this.isEditing.set(false);
  }
 
  delete(): void {
    const it = this.item();
    if (!it) return;
    if (confirm(`¿Eliminar "${it.name}"?`)) {
      this.media.delete(it.id);
    }
  }
 
  close(): void {
    this.media.selectedItem.set(null);
    this.isEditing.set(false);
  }
 
  //Tamaño
  readableSize(bytes: number): string {
    if (bytes < 1024)       return `${bytes} B`;
    if (bytes < 1024 ** 2)  return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  }

}
