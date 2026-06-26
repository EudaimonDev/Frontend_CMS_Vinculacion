import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'readingTime', standalone: true })
export class ReadingTimePipe implements PipeTransform {
  transform(minutes: number): string {
    return `${minutes} min lectura`;
  }
}
