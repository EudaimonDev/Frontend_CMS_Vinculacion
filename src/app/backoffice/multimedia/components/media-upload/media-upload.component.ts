import { DatePipe } from '@angular/common';
import { Component, computed, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MediaService } from '../../services/media.service';
@Component({
  selector: 'app-media-upload',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './media-upload.component.html',
  styleUrl: './media-upload.component.scss',
})
export class MediaUploadComponent { 
  readonly closed = output<void>();
 
  protected readonly media = inject(MediaService);
 
  //Estado local
  protected isDragging  = signal(false);
  protected isUploading = signal(false);
  protected progress    = signal(0);   // 0-100 simulado
  protected errors      = signal<string[]>([]);
 
  // Tipos MIME aceptados
  private readonly ACCEPTED_TYPES = [
    'image/jpeg', 'image/png', 'image/webp',
    'image/svg+xml', 'video/mp4', 'video/webm',
  ];

  private readonly MAX_SIZE = 10 * 1024 * 1024; // 10 MB
 
  //Drag & Drop
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }
 
  onDragLeave(): void {
    this.isDragging.set(false);
  }
 
  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    const files = Array.from(event.dataTransfer?.files ?? []);
    this.processFiles(files);
  }
 
  //Input de archivo
  onFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files  = Array.from(input.files ?? []);
    this.processFiles(files);
    input.value = ''; // reset para permitir subir el mismo archivo
  }
 
  //Procesamiento 
  private async processFiles(files: File[]): Promise<void> {
    this.errors.set([]);
 
    const valid   = files.filter(f => this.validate(f));
    if (!valid.length) return;
 
    this.isUploading.set(true);
    this.progress.set(0);
 
    for (let i = 0; i < valid.length; i++) {
      try {
        const dto = await this.media.fileToDto(valid[i]);
        this.media.add(dto);
      } catch {
        this.errors.update(e => [...e, `Error procesando: ${valid[i].name}`]);
      }
      // Progreso simulado
      this.progress.set(Math.round(((i + 1) / valid.length) * 100));
    }
 
    this.isUploading.set(false);
  }
 
  /** Valida tipo y tamaño; agrega error si falla */
  private validate(file: File): boolean {
    if (!this.ACCEPTED_TYPES.includes(file.type)) {
      this.errors.update(e => [...e, `Tipo no soportado: ${file.name}`]);
      return false;
    }
    if (file.size > this.MAX_SIZE) {
      this.errors.update(e => [...e, `Archivo muy grande (máx 10 MB): ${file.name}`]);
      return false;
    }
    return true;
  }
 
  close(): void {
    this.closed.emit();
  }
}
