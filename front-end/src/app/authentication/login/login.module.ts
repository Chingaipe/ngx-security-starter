// Angular modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Module components
import { LoginComponent } from './login.component';

// Material modules
import { MatProgressSpinnerModule } from '@angular/material';

// Routes guards
import { NoAuthGuard } from '@services/security/guards/no-auth.guard';

// Shared module
import { SharedModule } from '@app/core/modules/shared.module';

// Module routes
const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
    canActivate: [ NoAuthGuard ]
  }
];

@NgModule({
  declarations: [
    // Module components
    LoginComponent
  ],
  imports: [
    // Angular modules
    CommonModule,
    // Forms modules
    FormsModule,
    ReactiveFormsModule,
    // Application routes injection into the application forChild() routes
    RouterModule.forChild(routes),
    // Material modules
    MatProgressSpinnerModule,
    // Shared module
    SharedModule
  ]
})
export class LoginModule { }
