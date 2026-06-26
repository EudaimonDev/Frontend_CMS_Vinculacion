import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { ContactoModalComponent } from '../components/contacto-modal/contacto-modal.component';
import { AccesibilidadModalComponent } from '../components/accesibilidad-modal/accesibilidad-modal.component';
import { PrivacidadLayoutModalComponent } from '../components/privacidad-layout-modal/privacidad-layout-modal.component';

@Component({
  selector: 'app-page-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarComponent,
    ContactoModalComponent,
    AccesibilidadModalComponent,
    CommonModule,
    PrivacidadLayoutModalComponent,
  ],
  templateUrl: './page-layout.component.html',
  styleUrls: ['./page-layout.component.scss'],
})
export class PageLayoutComponent {
  showContact: boolean = false;
  showAccess: boolean = false;
  showPrivacidad: boolean = false;

  currentYear: number = new Date().getFullYear();

  toggleContact(status: boolean): void {
    this.showContact = status;
  }

  toggleAccess(status: boolean): void {
    this.showAccess = status;
  }

  togglePrivacidad(status: boolean): void {
    this.showPrivacidad = status;
  }
}
