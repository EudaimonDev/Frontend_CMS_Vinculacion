import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { User, UsersService } from '../users';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [ReactiveFormsModule], 
  templateUrl: './users.html'
})
export class Users implements OnInit {
  userList: User[] = [];
  isLoading: boolean = true;
  
  // Controladores de estado
  isModalOpen: boolean = false; 
  editingUserId: number | null = null; // Estado de Edición o Creación

  userForm = new FormGroup({
    nombre: new FormControl('', Validators.required),
    correo: new FormControl('', [Validators.required, Validators.email]),
    rol: new FormControl('Editor', Validators.required),
    estado: new FormControl('Activo', Validators.required)
  });

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    this.usersService.getUsers().subscribe({
      next: (data: any) => {
        this.userList = data; 
        this.isLoading = false;
      }
    });
  }

  openModal(user?: User) {
    this.isModalOpen = true;
    if (user) {
      // Llenar el formulario con los datos del usuario
      this.editingUserId = user.id;
      this.userForm.patchValue({
        nombre: user.name,
        correo: user.email,
        rol: user.role,
        estado: user.status
      });
    } else {
      // Limpiar el formulario
      this.editingUserId = null;
      this.userForm.reset({ rol: 'Editor', estado: 'Activo' });
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.editingUserId = null; // Se resetea el modo edición al cerrar el modal
  }

  // Guardar User :: Crea o Actualiza según el estado de editingUserId
  saveUser() {
    if (this.userForm.valid) {
      const formValues = this.userForm.value;
      
      if (this.editingUserId) {
        // ACTUALIZAR (Update)
        const index = this.userList.findIndex(u => u.id === this.editingUserId);
        if (index !== -1) {
          this.userList[index] = {
            ...this.userList[index],
            name: formValues.nombre || '',
            email: formValues.correo || '',
            role: formValues.rol || 'Editor',
            status: formValues.estado || 'Activo'
          };
        }
      } else {
        // CREAR (Create)
        const newUser: User = {
          id: this.userList.length > 0 ? Math.max(...this.userList.map(u => u.id)) + 1 : 1, 
          name: formValues.nombre || '',
          email: formValues.correo || '',
          role: formValues.rol || 'Editor',
          status: formValues.estado || 'Activo'
        };
        this.userList.push(newUser);
      }

      this.closeModal();
    }
  }

  // Eliminar User :: Advertencia
  deleteUser(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      this.userList = this.userList.filter(user => user.id !== id);
    }
  }
}