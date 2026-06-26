import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

// Modelo de Usuario (mock)
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  
  // Mock de datos
  private mockUsers: User[] = [
    { id: 1, name: 'Vicky Narea', email: 'vicky.narea@ug.edu.ec', role: 'Administrador', status: 'Activo' },
    { id: 2, name: 'Juan Sebastián', email: 'juan.nicholls@ug.edu.ec', role: 'Editor', status: 'Activo' },
    { id: 3, name: 'Edinson Ramirez', email: 'edinson.ramirez@ug.edu.ec', role: 'Editor', status: 'Inactivo' }
  ];

  constructor() { }

  // Pedir datos al servidor (mock)
  getUsers(): Observable<User[]> {
    // Simular que el internet tarda casi 1 segundo en responder (mock)
    return of(this.mockUsers).pipe(delay(800)); 
  }
}